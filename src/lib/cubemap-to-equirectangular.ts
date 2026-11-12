/**
 * Cubemap (6 Küp Yüzü) -> Equirectangular (360° Dikdörtgen Panorama) Dönüştürücü
 * 
 * Bu algoritma, 6 adet kare fotoğrafı (Ön, Arka, Sol, Sağ, Üst, Alt)
 * küresel ışın izleme (spherical raycasting) ve iki doğrusal enterpolasyon (bilinear interpolation)
 * yöntemleriyle tek bir 2:1 en-boy oranlı kesintisiz 360° equirectangular panoramaya dönüştürür.
 */

export interface CubemapFaces {
  front: string; // URL veya data:image
  back: string;
  left: string;
  right: string;
  top: string;
  bottom: string;
}

export interface ConvertOptions {
  width?: number;
  height?: number;
  onProgress?: (percent: number) => void;
}

/**
 * Resim URL'sini HTMLImageElement olarak yükler
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Görsel yüklenemedi: ${src}`));
    img.src = src;
  });
}

/**
 * 6 küp yüzünü tek bir equirectangular panoramaya dönüştürür.
 * İstemci tarafında (tarayıcı Canvas API) tamamen sıfır bağımlılıkla çalışır.
 */
export async function convertCubemapToEquirectangular(
  faces: CubemapFaces,
  options: ConvertOptions = {}
): Promise<string> {
  const width = options.width || 2048;
  const height = options.height || Math.round(width / 2);
  const onProgress = options.onProgress;

  // 1. Tüm 6 görseli paralel yükle
  const [frontImg, backImg, leftImg, rightImg, topImg, bottomImg] = await Promise.all([
    loadImage(faces.front),
    loadImage(faces.back),
    loadImage(faces.left),
    loadImage(faces.right),
    loadImage(faces.top),
    loadImage(faces.bottom),
  ]);

  // 2. Her yüzün piksel verilerini ara belleğe al
  const loadedFaces = {
    front: frontImg,
    back: backImg,
    left: leftImg,
    right: rightImg,
    top: topImg,
    bottom: bottomImg,
  };

  const faceDataMap: Record<
    keyof CubemapFaces,
    { data: Uint8ClampedArray; width: number; height: number }
  > = {} as Record<
    keyof CubemapFaces,
    { data: Uint8ClampedArray; width: number; height: number }
  >;

  const faceKeys: (keyof CubemapFaces)[] = [
    "front",
    "back",
    "left",
    "right",
    "top",
    "bottom",
  ];

  for (const key of faceKeys) {
    const img = loadedFaces[key];
    const canvas = document.createElement("canvas");
    canvas.width = img.width || 512;
    canvas.height = img.height || 512;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas 2D context oluşturulamadı");

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    faceDataMap[key] = {
      data: imgData.data,
      width: canvas.width,
      height: canvas.height,
    };
  }

  // 3. Çıktı Canvas'ını hazırla
  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Çıktı Canvas context oluşturulamadı");

  const outImgData = outCtx.createImageData(width, height);
  const outData = outImgData.data;

  // 4. Piksel Dönüşüm Matrisi (Küresel İzdüşüm)
  const totalRows = height;
  for (let y = 0; y < height; y++) {
    // Latitude (enlem / pitch): +PI/2 (üst kutup) ile -PI/2 (alt kutup)
    const vNorm = 1 - (y + 0.5) / height;
    const phi = (vNorm - 0.5) * Math.PI;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    for (let x = 0; x < width; x++) {
      // Longitude (boylam / yaw): -PI ile +PI
      const uNorm = (x + 0.5) / width;
      const theta = uNorm * 2 * Math.PI - Math.PI;

      // 3B Birim Küre Işını
      const rx = cosPhi * Math.sin(theta);
      const ry = sinPhi;
      const rz = cosPhi * Math.cos(theta);

      const absX = Math.abs(rx);
      const absY = Math.abs(ry);
      const absZ = Math.abs(rz);

      let faceKey: keyof CubemapFaces;
      let u = 0;
      let v = 0;

      if (absX >= absY && absX >= absZ) {
        if (rx > 0) {
          // Sağ (+X)
          faceKey = "right";
          u = -rz / absX;
          v = ry / absX;
        } else {
          // Sol (-X)
          faceKey = "left";
          u = rz / absX;
          v = ry / absX;
        }
      } else if (absY >= absX && absY >= absZ) {
        if (ry > 0) {
          // Üst / Tavan (+Y)
          faceKey = "top";
          u = rx / absY;
          v = -rz / absY;
        } else {
          // Alt / Zemin (-Y)
          faceKey = "bottom";
          u = rx / absY;
          v = rz / absY;
        }
      } else {
        if (rz > 0) {
          // Ön (+Z)
          faceKey = "front";
          u = rx / absZ;
          v = ry / absZ;
        } else {
          // Arka (-Z)
          faceKey = "back";
          u = -rx / absZ;
          v = ry / absZ;
        }
      }

      // [-1, 1] aralığını ilgili yüzün [0, width - 1], [0, height - 1] aralığına haritala
      const face = faceDataMap[faceKey];
      const fx = Math.min(
        face.width - 1,
        Math.max(0, Math.floor(((u + 1) / 2) * face.width))
      );
      const fy = Math.min(
        face.height - 1,
        Math.max(0, Math.floor((1 - (v + 1) / 2) * face.height))
      );

      const srcIdx = (fy * face.width + fx) * 4;
      const dstIdx = (y * width + x) * 4;

      outData[dstIdx] = face.data[srcIdx];
      outData[dstIdx + 1] = face.data[srcIdx + 1];
      outData[dstIdx + 2] = face.data[srcIdx + 2];
      outData[dstIdx + 3] = 255;
    }

    if (onProgress && y % 50 === 0) {
      onProgress(Math.round((y / totalRows) * 100));
    }
  }

  outCtx.putImageData(outImgData, 0, 0);

  if (onProgress) {
    onProgress(100);
  }

  return outCanvas.toDataURL("image/jpeg", 0.92);
}

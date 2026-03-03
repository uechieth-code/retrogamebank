import sharp from "sharp";
import fs from "fs";
import path from "path";

// SVG to create the OGP image with retro game aesthetic
const createOGPSVG = () => {
  const width = 1200;
  const height = 630;
  const darkBg = "#0a0a0f";
  const accentColor = "#00d4ff";
  const textWhite = "#ffffff";

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Dark background -->
      <rect width="${width}" height="${height}" fill="${darkBg}"/>

      <!-- Subtle grid pattern for retro feel -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a2e" stroke-width="0.5"/>
        </pattern>

        <!-- Glow filter for cyan accent -->
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Grid background -->
      <rect width="${width}" height="${height}" fill="url(#grid)"/>

      <!-- Top border accent -->
      <rect width="${width}" height="4" fill="${accentColor}" filter="url(#glow)"/>

      <!-- Bottom border accent -->
      <rect y="${height - 4}" width="${width}" height="4" fill="${accentColor}" filter="url(#glow)"/>

      <!-- Left side decorative bars (pixel-art style controller) -->
      <rect x="40" y="150" width="20" height="20" fill="${accentColor}" filter="url(#glow)"/>
      <rect x="40" y="180" width="20" height="80" fill="#2a2a4e"/>
      <rect x="40" y="275" width="20" height="20" fill="${accentColor}" filter="url(#glow)"/>

      <!-- Left side accent line -->
      <line x1="70" y1="100" x2="70" y2="530" stroke="${accentColor}" stroke-width="2" opacity="0.3"/>

      <!-- Right side decorative bars (mirror) -->
      <rect x="${width - 60}" y="150" width="20" height="20" fill="${accentColor}" filter="url(#glow)"/>
      <rect x="${width - 60}" y="180" width="20" height="80" fill="#2a2a4e"/>
      <rect x="${width - 60}" y="275" width="20" height="20" fill="${accentColor}" filter="url(#glow)"/>

      <!-- Right side accent line -->
      <line x1="${width - 70}" y1="100" x2="${width - 70}" y2="530" stroke="${accentColor}" stroke-width="2" opacity="0.3"/>

      <!-- Center content area -->
      <g>
        <!-- Main title: レトロゲームバンク -->
        <text
          x="600"
          y="200"
          font-family="'Arial Black', sans-serif"
          font-size="90"
          font-weight="bold"
          fill="${accentColor}"
          text-anchor="middle"
          filter="url(#glow)"
        >
          レトロゲームバンク
        </text>

        <!-- English subtitle -->
        <text
          x="600"
          y="280"
          font-family="'Courier New', monospace"
          font-size="48"
          font-weight="bold"
          fill="${textWhite}"
          text-anchor="middle"
          letter-spacing="4"
        >
          RetroGameBank
        </text>

        <!-- Description text -->
        <text
          x="600"
          y="370"
          font-family="'Arial', sans-serif"
          font-size="28"
          fill="#cccccc"
          text-anchor="middle"
        >
          24機種 15,000タイトル以上のレトロゲーム価格情報
        </text>

        <!-- Decorative pixel boxes below text -->
        <g>
          <!-- Left pixel box -->
          <rect x="300" y="420" width="12" height="12" fill="${accentColor}" filter="url(#glow)"/>
          <rect x="320" y="420" width="12" height="12" fill="${accentColor}" filter="url(#glow)"/>
          <rect x="340" y="420" width="12" height="12" fill="${accentColor}" filter="url(#glow)"/>

          <!-- Right pixel box -->
          <rect x="${width - 340}" y="420" width="12" height="12" fill="${accentColor}" filter="url(#glow)"/>
          <rect x="${width - 320}" y="420" width="12" height="12" fill="${accentColor}" filter="url(#glow)"/>
          <rect x="${width - 300}" y="420" width="12" height="12" fill="${accentColor}" filter="url(#glow)"/>
        </g>

        <!-- Bottom tagline -->
        <text
          x="600"
          y="550"
          font-family="'Arial', sans-serif"
          font-size="18"
          fill="#888888"
          text-anchor="middle"
          opacity="0.8"
        >
          レトロゲームの相場がひと目で分かる価格情報データベース
        </text>
      </g>
    </svg>
  `;
};

const generateOGP = async () => {
  try {
    const svg = createOGPSVG();
    const outputPath = path.join(
      path.resolve(),
      "public",
      "ogp.png"
    );

    // Ensure public directory exists
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public", { recursive: true });
    }

    // Convert SVG to PNG using sharp
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`✓ OGP image generated: ${outputPath}`);
    console.log(`  Dimensions: 1200x630px`);
  } catch (error) {
    console.error("Error generating OGP image:", error);
    process.exit(1);
  }
};

generateOGP();

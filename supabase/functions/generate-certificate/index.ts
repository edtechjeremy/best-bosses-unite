
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const bossFirstName = url.searchParams.get('firstName');
    const bossLastName = url.searchParams.get('lastName');
    
    if (!bossFirstName || !bossLastName) {
      return new Response("Missing required parameters", { status: 400 });
    }

    // Create SVG certificate server-side
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const svgContent = `
      <svg width="1400" height="1000" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Background gradient -->
          <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
          </linearGradient>
          
          <!-- Best Boss text gradient -->
          <linearGradient id="bestBossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#fb923c;stop-opacity:1" />
          </linearGradient>
          
          <!-- Text shadow filter -->
          <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
          
          <!-- Boss name glow filter -->
          <filter id="bossNameGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="rgba(247, 147, 22, 0.5)"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="1400" height="1000" fill="url(#backgroundGradient)"/>
        
        <!-- Outer border -->
        <rect x="60" y="60" width="1280" height="880" fill="none" stroke="#ffffff" stroke-width="12"/>
        
        <!-- Middle border -->
        <rect x="80" y="80" width="1240" height="840" fill="none" stroke="#f97316" stroke-width="6"/>
        
        <!-- Inner border -->
        <rect x="100" y="100" width="1200" height="800" fill="none" stroke="#ffffff" stroke-width="2"/>
        
        <!-- CERTIFIED title -->
        <text x="700" y="240" font-family="Georgia, serif" font-size="80" font-weight="bold" 
              fill="#ffffff" text-anchor="middle" filter="url(#textShadow)">CERTIFIED</text>
        
        <!-- BEST BOSS title -->
        <text x="700" y="340" font-family="Georgia, serif" font-size="90" font-weight="bold" 
              fill="url(#bestBossGradient)" text-anchor="middle" filter="url(#textShadow)">BEST BOSS</text>
        
        <!-- Subtitle -->
        <text x="700" y="420" font-family="Georgia, serif" font-size="36" 
              fill="rgba(255,255,255,0.9)" text-anchor="middle">This certificate is proudly presented to</text>
        
        <!-- Boss name -->
        <text x="700" y="540" font-family="Georgia, serif" font-size="72" font-weight="bold" 
              fill="#ffffff" text-anchor="middle" filter="url(#bossNameGlow)">${bossFirstName} ${bossLastName}</text>
        
        <!-- Recognition text line 1 -->
        <text x="700" y="620" font-family="Georgia, serif" font-size="32" 
              fill="rgba(255,255,255,0.95)" text-anchor="middle">in recognition of outstanding leadership</text>
        
        <!-- Recognition text line 2 -->
        <text x="700" y="670" font-family="Georgia, serif" font-size="32" 
              fill="rgba(255,255,255,0.95)" text-anchor="middle">and exceptional management excellence</text>
        
        <!-- Organization name -->
        <text x="700" y="780" font-family="Georgia, serif" font-size="24" font-weight="bold" 
              fill="#f97316" text-anchor="middle" filter="url(#textShadow)">BESTBOSSES.ORG</text>
        
        <!-- Tagline -->
        <text x="700" y="810" font-family="Georgia, serif" font-size="20" 
              fill="rgba(255,255,255,0.8)" text-anchor="middle">Great Leaders, Verified.</text>
        
        <!-- Date -->
        <text x="700" y="860" font-family="Georgia, serif" font-size="18" 
              fill="rgba(255,255,255,0.7)" text-anchor="middle">Certified: ${formattedDate}</text>
      </svg>
    `;

    // Convert SVG to PNG using a web service or return SVG directly
    // For now, we'll use a service to convert SVG to PNG
    const svgBuffer = new TextEncoder().encode(svgContent);
    
    // Use htmlcsstoimage.com API or similar service to convert SVG to PNG
    // For this implementation, we'll use a simple approach with base64 encoded SVG
    const base64Svg = btoa(svgContent);
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
    
    // Since we can't directly convert SVG to PNG in Deno without external dependencies,
    // we'll create a minimal HTML page that auto-downloads the PNG
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Downloading Certificate...</title>
        <style>
          body { 
            font-family: Georgia, serif; 
            text-align: center; 
            padding: 40px; 
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 0;
          }
          .message {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255,255,255,0.2);
          }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>🏆 Generating Your Certificate</h1>
          <p>Your Best Boss certificate is being prepared for download...</p>
        </div>
        <script>
          function downloadCertificate() {
            const canvas = document.createElement('canvas');
            canvas.width = 1400;
            canvas.height = 1000;
            const ctx = canvas.getContext('2d');
            
            // Premium gradient background
            const gradient = ctx.createLinearGradient(0, 0, 1400, 1000);
            gradient.addColorStop(0, '#3b82f6');
            gradient.addColorStop(0.5, '#6366f1');
            gradient.addColorStop(1, '#8b5cf6');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1400, 1000);
            
            // Luxury border with multiple layers
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 12;
            ctx.strokeRect(60, 60, 1280, 880);
            
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 6;
            ctx.strokeRect(80, 80, 1240, 840);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(100, 100, 1200, 800);
            
            // Premium title with shadow
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 80px Georgia, serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.fillText('CERTIFIED', 700, 240);
            
            // "Best Boss" with luxury styling
            ctx.font = 'bold 90px Georgia, serif';
            const bestBossGradient = ctx.createLinearGradient(0, 280, 0, 360);
            bestBossGradient.addColorStop(0, '#f97316');
            bestBossGradient.addColorStop(1, '#fb923c');
            ctx.fillStyle = bestBossGradient;
            ctx.fillText('BEST BOSS', 700, 340);
            
            // Elegant subtitle
            ctx.font = '36px Georgia, serif';
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.shadowBlur = 4;
            ctx.fillText('This certificate is proudly presented to', 700, 420);
            
            // Boss name with premium styling
            ctx.font = 'bold 72px Georgia, serif';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(247, 147, 22, 0.5)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillText('${bossFirstName} ${bossLastName}', 700, 540);
            
            // Recognition text
            ctx.font = '32px Georgia, serif';
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 4;
            ctx.fillText('in recognition of outstanding leadership', 700, 620);
            ctx.fillText('and exceptional management excellence', 700, 670);
            
            // Premium footer with warm orange accent
            ctx.fillStyle = '#f97316';
            ctx.font = 'bold 24px Georgia, serif';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 4;
            ctx.fillText('BESTBOSSES.ORG', 700, 780);
            
            ctx.font = '20px Georgia, serif';
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillText('Great Leaders, Verified.', 700, 810);
            
            // Elegant date
            ctx.font = '18px Georgia, serif';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            const today = new Date();
            ctx.fillText('Certified: ' + today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 700, 860);
            
            // Download
            const link = document.createElement('a');
            link.download = '${bossFirstName}-${bossLastName}-best-boss-certificate.png';
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            
            // Close the window after download (for popup windows)
            setTimeout(() => {
              if (window.opener) {
                window.close();
              }
            }, 1000);
          }
          
          // Auto-download when page loads
          window.addEventListener('load', () => {
            setTimeout(downloadCertificate, 500);
          });
        </script>
      </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        ...corsHeaders
      }
    });
  } catch (error: any) {
    console.error("Error generating certificate:", error);
    return new Response("Error generating certificate", { 
      status: 500,
      headers: corsHeaders 
    });
  }
};

serve(handler);

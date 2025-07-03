
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Create canvas and generate certificate
    const canvas = new OffscreenCanvas(1400, 1000);
    const ctx = canvas.getContext('2d')!;
    
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
    ctx.fillText(`${bossFirstName} ${bossLastName}`, 700, 540);
    
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
    
    // Convert canvas to blob
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const arrayBuffer = await blob.arrayBuffer();
    
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${bossFirstName}-${bossLastName}-best-boss-certificate.png"`,
        ...corsHeaders
      }
    });
  } catch (error: any) {
    console.error("Error generating certificate:", error);
    
    // Fallback: Return HTML page that generates certificate client-side
    const url = new URL(req.url);
    const bossFirstName = url.searchParams.get('firstName') || 'Boss';
    const bossLastName = url.searchParams.get('lastName') || 'Leader';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Download Your Best Boss Certificate</title>
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
          .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255,255,255,0.2);
            max-width: 600px;
          }
          h1 { 
            font-size: 48px; 
            margin-bottom: 20px; 
            color: #f97316;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          p { 
            font-size: 20px; 
            margin-bottom: 30px; 
            line-height: 1.6;
          }
          .download-btn {
            background: #f97316;
            color: white;
            padding: 15px 30px;
            font-size: 18px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-family: Georgia, serif;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(247, 147, 22, 0.3);
            transition: all 0.3s ease;
            margin: 10px;
            text-decoration: none;
            display: inline-block;
          }
          .download-btn:hover {
            background: #ea580c;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(247, 147, 22, 0.4);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏆 Congratulations, ${bossFirstName}!</h1>
          <p>Your premium Best Boss certificate is ready for download.</p>
          <p>Click the button below to download your certificate:</p>
          <button class="download-btn" onclick="downloadCertificate()">Download Certificate</button>
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
          }
          
          // Auto-download when page loads
          window.addEventListener('load', () => {
            setTimeout(downloadCertificate, 1000);
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
  }
};

serve(handler);

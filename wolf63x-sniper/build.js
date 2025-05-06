/*jshint esversion: 11 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  wasmPackPath: 'wasm-pack',
  targetDir: 'pkg',
  publicDir: 'public',
  bundleFile: 'public/wolf63x_sniper_bg.js'
};

console.log('🚀 Starting Wolf63x Solana Sniper Bot build process...');

// Step 1: Build the WASM package
try {
  console.log('📦 Building WASM package...');
  execSync(`${config.wasmPackPath} build --target web --out-dir ${config.targetDir}`, { stdio: 'inherit' });
  console.log('✅ WASM package built successfully!');
} catch (error) {
  console.error('❌ Failed to build WASM package:', error);
  process.exit(1);
}

// Step 2: Copy WASM files to public directory
try {
  console.log('📋 Copying WASM files to public directory...');
  
  // Ensure public directory exists
  if (!fs.existsSync(config.publicDir)) {
    fs.mkdirSync(config.publicDir, { recursive: true });
  }
  
  // Copy WASM and JS files
  const filesToCopy = [
    { src: `${config.targetDir}/wolf63x_sniper_bg.wasm`, dest: `${config.publicDir}/wolf63x_sniper_bg.wasm` },
    { src: `${config.targetDir}/wolf63x_sniper.js`, dest: `${config.publicDir}/wolf63x_sniper.js` }
  ];
  
  filesToCopy.forEach(file => {
    fs.copyFileSync(file.src, file.dest);
    console.log(`   Copied ${file.src} to ${file.dest}`);
  });
  
  console.log('✅ WASM files copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy WASM files:', error);
  process.exit(1);
}

// Step 3: Create WASM loader script
try {
  console.log('📝 Creating WASM loader script...');
  
  const loaderContent = `/*jshint esversion: 11 */
// Wolf63x Solana Sniper Bot WASM Loader
async function initWasm() {
  try {
    console.log('Initializing Wolf63x Solana Sniper Bot WASM...');
    const wolf63x = await import('./wolf63x_sniper.js');
    await wolf63x.default();
    
    // Initialize the bot
    await wolf63x.initialize();
    
    // Create bot instance
    window.sniperBot = await wolf63x.create_bot();
    
    console.log('Wolf63x Solana Sniper Bot WASM initialized successfully!');
    
    // Dispatch event to notify the app that WASM is ready
    window.dispatchEvent(new CustomEvent('wasm-ready'));
    
    return wolf63x;
  } catch (error) {
    console.error('Failed to initialize Wolf63x Solana Sniper Bot WASM:', error);
    throw error;
  }
}

// Initialize WASM when the page loads
window.addEventListener('DOMContentLoaded', () => {
  initWasm().catch(error => {
    console.error('WASM initialization failed:', error);
    document.getElementById('error-message').textContent = 'Failed to initialize Wolf63x Solana Sniper Bot. Please refresh the page or contact support.';
    document.getElementById('error-container').style.display = 'block';
  });
});
`;
  
  fs.writeFileSync(`${config.publicDir}/wasm-loader.js`, loaderContent);
  console.log('✅ WASM loader script created successfully!');
} catch (error) {
  console.error('❌ Failed to create WASM loader script:', error);
  process.exit(1);
}

// Step 4: Update index.html to include WASM loader
try {
  console.log('🔄 Updating index.html to include WASM loader...');
  
  const indexPath = `${config.publicDir}/index.html`;
  
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check if WASM loader is already included
    if (!indexContent.includes('wasm-loader.js')) {
      // Find the position to insert the script tag (before the first script tag or before </head>)
      const scriptTagPos = indexContent.indexOf('<script');
      const headClosePos = indexContent.indexOf('</head>');
      
      const insertPos = scriptTagPos !== -1 ? scriptTagPos : (headClosePos !== -1 ? headClosePos : null);
      
      if (insertPos !== null) {
        const wasmLoaderScript = '<script src="wasm-loader.js"></script>\n    ';
        indexContent = indexContent.slice(0, insertPos) + wasmLoaderScript + indexContent.slice(insertPos);
        
        fs.writeFileSync(indexPath, indexContent);
        console.log('✅ Updated index.html to include WASM loader!');
      } else {
        console.warn('⚠️ Could not find appropriate position to insert WASM loader script in index.html');
      }
    } else {
      console.log('✅ WASM loader already included in index.html!');
    }
  } else {
    console.warn('⚠️ index.html not found in public directory');
  }
} catch (error) {
  console.error('❌ Failed to update index.html:', error);
  process.exit(1);
}

console.log('🎉 Build process completed successfully!');
console.log('🌐 You can now run the server to test the application.');

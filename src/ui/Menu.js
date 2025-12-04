export class Menu {
  constructor(container) {
    this.container = container;
    this.isVisible = false;
    this.options = [
      { id: 'explore', label: 'EXPLORE GALAXY', action: 'explore' },
      { id: 'solar', label: 'SOLAR SYSTEM', action: 'solar' },
      { id: 'sandbox', label: 'SANDBOX MODE', action: 'sandbox' }
    ];
    this.buttons = [];
    
    this.menuDiv = document.createElement('div');
    this.menuDiv.style.position = 'absolute';
    this.menuDiv.style.top = '0';
    this.menuDiv.style.left = '0';
    this.menuDiv.style.width = '100%';
    this.menuDiv.style.height = '100%';
    this.menuDiv.style.display = 'none';
    this.menuDiv.style.flexDirection = 'column';
    this.menuDiv.style.justifyContent = 'center';
    this.menuDiv.style.alignItems = 'center';
    this.menuDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    this.menuDiv.style.zIndex = '100';
    this.menuDiv.style.backdropFilter = 'blur(10px)';
    
    this.init();
    this.container.appendChild(this.menuDiv);
    
    // Cursor
    this.cursor = document.createElement('div');
    this.cursor.style.position = 'absolute';
    this.cursor.style.width = '20px';
    this.cursor.style.height = '20px';
    this.cursor.style.borderRadius = '50%';
    this.cursor.style.border = '2px solid #00ffff';
    this.cursor.style.backgroundColor = 'rgba(0, 255, 255, 0.3)';
    this.cursor.style.transform = 'translate(-50%, -50%)';
    this.cursor.style.pointerEvents = 'none';
    this.cursor.style.zIndex = '101';
    this.cursor.style.display = 'none';
    this.cursor.style.boxShadow = '0 0 10px #00ffff';
    this.container.appendChild(this.cursor);
  }

  init() {
    const title = document.createElement('h1');
    title.innerText = 'CELESTIAL ARCHITECT';
    title.style.fontFamily = '"Orbitron", sans-serif';
    title.style.fontSize = '60px';
    title.style.color = '#00ffff';
    title.style.textShadow = '0 0 20px #00ffff';
    title.style.marginBottom = '50px';
    this.menuDiv.appendChild(title);

    // Main Menu Container
    this.mainMenuContainer = document.createElement('div');
    this.mainMenuContainer.style.display = 'flex';
    this.mainMenuContainer.style.flexDirection = 'column';
    this.mainMenuContainer.style.alignItems = 'center';
    this.menuDiv.appendChild(this.mainMenuContainer);

    this.options.forEach(opt => {
      const btn = this.createButton(opt.label, opt.action);
      this.mainMenuContainer.appendChild(btn);
      this.buttons.push(btn);
    });

    // Galaxy Select Container (Hidden by default)
    this.galaxySelectContainer = document.createElement('div');
    this.galaxySelectContainer.style.display = 'none';
    this.galaxySelectContainer.style.flexDirection = 'column';
    this.galaxySelectContainer.style.alignItems = 'center';
    this.menuDiv.appendChild(this.galaxySelectContainer);
    
    const galaxyOptions = [
        { label: 'SPIRAL GALAXY', action: 'galaxy_spiral' },
        { label: 'RING GALAXY', action: 'galaxy_ring' },
        { label: 'NEBULA CLOUD', action: 'galaxy_nebula' },
        { label: 'BACK', action: 'back' }
    ];
    
    galaxyOptions.forEach(opt => {
        const btn = this.createButton(opt.label, opt.action);
        this.galaxySelectContainer.appendChild(btn);
        this.buttons.push(btn); // Add to interactable buttons
    });
  }

  createButton(label, action) {
      const btn = document.createElement('div');
      btn.innerText = label;
      btn.style.fontFamily = '"Orbitron", sans-serif';
      btn.style.fontSize = '30px';
      btn.style.color = '#ffffff';
      btn.style.padding = '20px 40px';
      btn.style.margin = '10px';
      btn.style.border = '2px solid rgba(255, 255, 255, 0.2)';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.3s';
      btn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      btn.dataset.action = action;
      return btn;
  }

  showGalaxySelect() {
      this.mainMenuContainer.style.display = 'none';
      this.galaxySelectContainer.style.display = 'flex';
  }

  showMainMenu() {
      this.mainMenuContainer.style.display = 'flex';
      this.galaxySelectContainer.style.display = 'none';
  }

  show() {
    this.isVisible = true;
    this.menuDiv.style.display = 'flex';
    this.cursor.style.display = 'block';
    this.showMainMenu(); // Reset to main
  }

  hide() {
    this.isVisible = false;
    this.menuDiv.style.display = 'none';
    this.cursor.style.display = 'none';
  }

  updateCursor(x, y, isClicking, audioManager) {
    if (!this.isVisible) return null;

    // Map 0-1 to screen coords
    const screenX = (1 - x) * window.innerWidth; // Mirror X
    const screenY = y * window.innerHeight;

    this.cursor.style.left = `${screenX}px`;
    this.cursor.style.top = `${screenY}px`;
    
    // Check collisions
    let hoveredAction = null;
    let anyHover = false;
    
    this.buttons.forEach(btn => {
        // Only check visible buttons
        if (btn.parentElement.style.display === 'none') return;

        const rect = btn.getBoundingClientRect();
        if (screenX >= rect.left && screenX <= rect.right &&
            screenY >= rect.top && screenY <= rect.bottom) {
            
            anyHover = true;
            
            // Hover State
            if (btn.dataset.hovered !== 'true') {
                btn.dataset.hovered = 'true';
                btn.style.backgroundColor = 'rgba(0, 255, 255, 0.2)';
                btn.style.borderColor = '#00ffff';
                btn.style.transform = 'scale(1.1)';
                if (audioManager) audioManager.playHover();
            }
            
            if (isClicking) {
                hoveredAction = btn.dataset.action;
                // Click visual
                btn.style.backgroundColor = '#00ffff';
                btn.style.color = '#000000';
            }
        } else {
            // Reset State
            if (btn.dataset.hovered === 'true') {
                btn.dataset.hovered = 'false';
                btn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                btn.style.transform = 'scale(1)';
                btn.style.color = '#ffffff';
            }
        }
    });
    
    if (isClicking) {
        this.cursor.style.backgroundColor = '#00ffff';
        this.cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    } else {
        this.cursor.style.backgroundColor = 'rgba(0, 255, 255, 0.3)';
        this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    }

    return hoveredAction;
  }
}

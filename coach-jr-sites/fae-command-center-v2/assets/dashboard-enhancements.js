// FAE DASHBOARD UI ENHANCEMENTS v3.0
// Interactive features for enhanced user experience

(function() {
  'use strict';

  // Enhanced Dashboard Controller
  const DashboardEnhancements = {
    
    init() {
      this.setupKPIAnimations();
      this.setupActivityTimeline();
      this.applyEnhancedStyles();
      console.log('✨ FAE Dashboard v3.0 - Enhanced UI Active');
    },

    setupKPIAnimations() {
      const kpiCards = document.querySelectorAll('.kpi-card, [class*="kpi"]');
      kpiCards.forEach((card, index) => {
        setTimeout(() => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = 'all 0.4s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        }, index * 100);
      });
    },

    setupActivityTimeline() {
      const items = document.querySelectorAll('.activity-item, .timeline-item');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = '0';
          item.style.transform = 'translateX(-20px)';
          setTimeout(() => {
            item.style.transition = 'all 0.3s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, 50);
        }, index * 80);
      });
    },

    applyEnhancedStyles() {
      document.querySelectorAll('.member-card').forEach(card => {
        if (!card.classList.contains('member-card-enhanced')) {
          card.classList.add('member-card-enhanced');
        }
      });

      document.querySelectorAll('table').forEach(table => {
        if (!table.classList.contains('table-enhanced')) {
          table.classList.add('table-enhanced');
        }
      });
    }
  };

  // Enhanced notification system
  window.showEnhancedNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 24px; right: 24px;
      background: var(--bg-modal); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 16px 20px;
      box-shadow: var(--shadow-lg); z-index: 10000;
      display: flex; align-items: center; gap: 12px;
      min-width: 300px; animation: slideIn 0.3s ease-out;
    `;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    const color = type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--accent)';
    
    notification.innerHTML = `
      <div style="width: 32px; height: 32px; border-radius: 8px; background: ${color}20; color: ${color}; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700;">
        ${icon}
      </div>
      <div style="flex: 1; color: var(--text-primary); font-size: 14px; font-weight: 500;">
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DashboardEnhancements.init());
  } else {
    DashboardEnhancements.init();
  }

})();

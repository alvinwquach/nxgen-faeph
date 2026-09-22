// FAE MOTION PRO v2.0 - Advanced Animation Controller
// $10,000 Premium Motion System

(function() {
  'use strict';

  const MotionPro = {
    
    init() {
      this.setupScrollAnimations();
      this.setupMagneticElements();
      this.setupCountUpNumbers();
      console.log('🎬 FAE Motion Pro v2.0 - Premium animations active');
    },

    setupScrollAnimations() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

      document.querySelectorAll('.scroll-reveal, [data-scroll-reveal]').forEach(el => {
        observer.observe(el);
      });
    },

    setupMagneticElements() {
      document.querySelectorAll('.magnetic, .btn-premium, .kpi-compact').forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const moveX = x * 0.15;
          const moveY = y * 0.15;
          el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
        });
      });
    },

    setupCountUpNumbers() {
      const countUp = (el, target) => {
        const duration = 1200;
        const start = parseInt(el.textContent) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
          current += increment;
          if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            current = target;
            clearInterval(timer);
          }
          
          if (el.dataset.format === 'currency') {
            el.textContent = '$' + Math.floor(current).toLocaleString();
          } else if (el.dataset.format === 'percent') {
            el.textContent = Math.floor(current) + '%';
          } else {
            el.textContent = Math.floor(current).toLocaleString();
          }
        }, 16);
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target);
            countUp(entry.target, target);
            observer.unobserve(entry.target);
          }
        });
      });

      document.querySelectorAll('.count-up, [data-count-up]').forEach(el => {
        observer.observe(el);
      });
    },

    showNotification(message, type = 'info', duration = 3000) {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.style.cssText = `
        position: fixed; top: 24px; right: 24px; z-index: 10000;
        background: var(--bg-secondary); border: 1px solid var(--border-primary);
        border-radius: 12px; padding: 16px 20px; min-width: 320px;
        box-shadow: 0 16px 48px -12px rgba(0,0,0,0.4);
        display: flex; align-items: center; gap: 12px;
      `;

      const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
      const colors = { success: '#16A34A', error: '#DC2626', warning: '#F59E0B', info: '#C9A227' };

      notification.innerHTML = `
        <div style="width:32px;height:32px;border-radius:8px;background:${colors[type]}20;color:${colors[type]};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;">
          ${icons[type]}
        </div>
        <div style="flex:1;color:var(--text-primary);font-size:14px;font-weight:500;">${message}</div>
      `;

      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('exit');
        setTimeout(() => notification.remove(), 250);
      }, duration);
    },

    staggerChildren(parent, delay = 50) {
      const children = parent.children;
      Array.from(children).forEach((child, index) => {
        child.style.animationDelay = `${index * delay}ms`;
        child.classList.add('animate-in');
      });
    }
  };

  window.MotionPro = MotionPro;
  window.notify = (msg, type) => MotionPro.showNotification(msg, type);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MotionPro.init());
  } else {
    MotionPro.init();
  }

})();

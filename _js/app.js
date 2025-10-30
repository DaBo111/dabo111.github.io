let pageLoaded = false;
let animationComplete = false;
let isStuckLoading = false;
let stuckAnimationInterval = null;

// Wait for DOM to be ready before starting animation
function initializePreloader() {
  startGraphAnimation();
  
  // Fallback: if loading takes too long, start alternating animation
  setTimeout(function() {
    if (!pageLoaded) {
      isStuckLoading = true;
      startStuckLoadingAnimation();
    }
  }, 300); // Start alternating after 0.3 seconds
}

// Try multiple ways to ensure initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePreloader);
} else {
  // DOM is already ready
  initializePreloader();
}

// Also try with a small delay as backup
setTimeout(function() {
  if (!animationComplete && !isStuckLoading) {
    initializePreloader();
  }
}, 50);

// Listen for page load
window.addEventListener('load', function() {
  pageLoaded = true;
  checkReadyToHide();
});

// Also start animation after a short delay as fallback
setTimeout(function() {
  if (!pageLoaded) {
    startGraphAnimation();
  }
}, 100);

$(document).ready(function() {
  $(window).on('beforeunload', function() {
    window.scrollTo(0, 0);
  });

  /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
  particlesJS.load('landing', 'assets/particles.json', function() {});

  // Typing Text
  var element = document.getElementById('txt-rotate');
  var toRotate = element.getAttribute('data-rotate');
  var period = element.getAttribute('data-period');
  setTimeout(function() {
    var messages = JSON.parse(toRotate);
    // If there's only one message, don't animate the typing
    if (messages.length === 1) {
      element.innerHTML = '<span class="wrap">' + messages[0] + '</span>';
    } else {
      new TxtRotate(element, messages, period);
    }
  }, 1500);

  // INJECT CSS
  var css = document.createElement('style');
  css.type = 'text/css';
  css.innerHTML = '#txt-rotate > .wrap { border-right: 0.08em solid #666 }';
  document.body.appendChild(css);

  // Initialize AOS
  AOS.init({
    disable: 'mobile',
    offset: 200,
    duration: 600,
    easing: 'ease-in-sine',
    delay: 100,
    once: true
  });

  // Initialize Floating Navigation
  initFloatingNav();
  
  // Initialize Research Year Filtering
  initResearchFiltering();
  
  // Initialize Blogs Year Filtering
  initBlogsFiltering();
  
  // Initialize Bug Report Modal
  initBugReportModal();
});

/* FUNCTIONS */
/* Graph-based Preloader */

function checkReadyToHide() {
  if (pageLoaded && animationComplete) {
    // Stop stuck loading animation if it's running
    if (stuckAnimationInterval) {
      clearInterval(stuckAnimationInterval);
      stuckAnimationInterval = null;
    }
    fadeOutPreloader(document.getElementById('preloader'), 69);
  }
}

function startStuckLoadingAnimation() {
  // Get all nodes
  const allNodes = document.querySelectorAll('.node');
  let isCurrentState = true; // true = all blue, false = all white
  
    stuckAnimationInterval = setInterval(() => {
    if (pageLoaded) {
      clearInterval(stuckAnimationInterval);
      return;
    }
    
    allNodes.forEach(node => {
      if (isCurrentState) {
        // Switch to white (previous state)
        node.classList.remove('active');
        node.style.animation = 'nodeDeactivation 0.3s ease';
      } else {
        // Switch to blue (current state)
        node.classList.add('active');
        node.style.animation = 'nodeActivation 0.3s ease';
      }
    });
    
    isCurrentState = !isCurrentState;
  }, 600); // Faster alternating: every 0.6 seconds
}

function startGraphAnimation() {
  const waves = [
    [document.getElementById('node-1')], // Wave 0: Initial node
    [document.getElementById('node-2'), document.getElementById('node-7')], // Wave 1: Neighbors of node-1
    [document.getElementById('node-3'), document.getElementById('node-5'), document.getElementById('node-8')], // Wave 2
    [document.getElementById('node-4'), document.getElementById('node-6'), document.getElementById('node-9')] // Wave 3
  ];
  
  // Check if nodes exist
  const allNodesExist = waves.flat().every(node => node !== null);
  if (!allNodesExist) {
    console.warn('Some graph nodes not found, retrying...');
    setTimeout(startGraphAnimation, 100);
    return;
  }
  
  let currentWave = 0;
  
  function activateWave() {
    if (currentWave < waves.length) {
      waves[currentWave].forEach((node, index) => {
        if (node) {
          setTimeout(() => {
            node.classList.add('active');
            // Add pulsing animation
            node.style.animation = 'nodeActivation 0.6s ease';
          }, index * 50); // Very fast stagger: 50ms
        }
      });
      
      currentWave++;
      
      // Move to next wave
      if (currentWave < waves.length) {
        setTimeout(activateWave, 200); // Very fast waves: 200ms
      } else {
        // Animation complete
        animationComplete = true;
        
        // If page is already loaded, hide immediately
        if (pageLoaded) {
          setTimeout(() => {
            fadeOutPreloader(document.getElementById('preloader'), 69);
          }, 100); // Very short pause to show completed state
        } else {
          // Page still loading, wait for it
          checkReadyToHide();
        }
      }
    }
  }
  
  // Start the animation
  activateWave();
}

function fadeOutPreloader(element, duration) {
  opacity = 1;

  interval = setInterval(function() {
    if (opacity <= 0) {
      element.style.zIndex = 0;
      element.style.opacity = 0;
      element.style.filter = 'alpha(opacity = 0)';

      // Allow horizontal scroll
      document.documentElement.style.overflowY = 'auto';

      // Remove preloader div
      document.getElementById('preloader').remove();

      clearInterval(interval);
    } else {
      opacity -= 0.1;
      element.style.opacity = opacity;
      element.style.filter = 'alpha(opacity = ' + opacity * 100 + ')';
    }
  }, duration);
}

/* Typing Text */

var TxtRotate = function(el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
};

TxtRotate.prototype.tick = function() {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }
  this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

  var that = this;
  var delta = 200 - Math.random() * 100;

  if (this.isDeleting) {
    delta /= 5;
  }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function() {
    that.tick();
  }, delta);
};

/* Word Cloud */

function randomizeOrder() {
  var parent = document.getElementById('skills');
  
  // Get only the skill divs (not the input/label elements)
  var skillDivs = parent.querySelectorAll('div[skill-type]');
  var skillsArray = Array.from(skillDivs);
  
  // Remove all skill divs from parent
  skillsArray.forEach(div => div.remove());
  
  // Randomize the array
  for (let i = skillsArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [skillsArray[i], skillsArray[j]] = [skillsArray[j], skillsArray[i]];
  }
  
  // Add them back to the parent (after the inputs and labels)
  skillsArray.forEach(div => parent.appendChild(div));
}

/* Floating Navigation */

function initFloatingNav() {
  // Smooth scrolling for navigation links and logo
  const allNavLinks = document.querySelectorAll('.nav-link, .logo-link');
  
  allNavLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 100; // Account for fixed nav
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Initialize navigation arrows
  initNavArrows();
  
  // Update active link on scroll
  window.addEventListener('scroll', updateActiveNavLink);
}

function initNavArrows() {
  const navMenu = document.querySelector('.nav-menu');
  const leftArrow = document.getElementById('nav-arrow-left');
  const rightArrow = document.getElementById('nav-arrow-right');
  
  if (!navMenu || !leftArrow || !rightArrow) return;
  
  function updateArrowVisibility() {
    const scrollLeft = navMenu.scrollLeft;
    const scrollWidth = navMenu.scrollWidth;
    const clientWidth = navMenu.clientWidth;
    const maxScrollLeft = scrollWidth - clientWidth;
    
    // Show/hide left arrow
    if (scrollLeft > 5) {
      leftArrow.classList.add('show');
    } else {
      leftArrow.classList.remove('show');
    }
    
    // Show/hide right arrow
    if (scrollLeft < maxScrollLeft - 5) {
      rightArrow.classList.add('show');
    } else {
      rightArrow.classList.remove('show');
    }
  }
  
  function scrollNav(direction) {
    const scrollAmount = 120; // Amount to scroll per click
    const currentScroll = navMenu.scrollLeft;
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    navMenu.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }
  
  // Arrow click handlers
  leftArrow.addEventListener('click', () => scrollNav('left'));
  rightArrow.addEventListener('click', () => scrollNav('right'));
  
  // Update arrow visibility on scroll
  navMenu.addEventListener('scroll', updateArrowVisibility);
  
  // Update arrow visibility on window resize
  window.addEventListener('resize', () => {
    setTimeout(updateArrowVisibility, 100);
  });
  
  // Initial check
  setTimeout(updateArrowVisibility, 100);
}

function updateActiveNavLink() {
  const sections = ['landing', 'about', 'timeline', 'research', 'skills', 'opensource', 'blogs', 'contact'];
  const scrollPos = window.scrollY + 150;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  let currentSection = 'landing';
  
  // Special case: if we're at the bottom of the page, highlight contact
  if (window.scrollY + windowHeight >= documentHeight - 50) {
    currentSection = 'contact';
  } else {
    // Normal section detection
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        // Check if the scroll position is within this section
        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          currentSection = sectionId;
        }
      }
    });
  }
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentSection) {
      link.classList.add('active');
    }
  });
}

/* Research Year Filtering */

function initResearchFiltering() {
  const filterButtons = document.querySelectorAll('.research-filters .filter-btn');
  const researchItems = document.querySelectorAll('.research-item');
  
  if (filterButtons.length === 0 || researchItems.length === 0) {
    return; // No research filtering needed
  }
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const selectedYear = this.getAttribute('data-year');
      
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Filter research items
      researchItems.forEach(item => {
        const itemYear = item.getAttribute('data-year');
        
        if (selectedYear === 'all' || itemYear === selectedYear) {
          item.style.display = 'block';
          item.classList.remove('hidden');
          // Re-trigger AOS animation
          if (item.getAttribute('data-aos')) {
            item.classList.add('aos-animate');
          }
        } else {
          item.style.display = 'none';
          item.classList.add('hidden');
        }
      });
    });
  });
  
  // Set default to latest year instead of "all"
  const yearButtons = Array.from(filterButtons).filter(btn => btn.getAttribute('data-year') !== 'all');
  const latestYear = Math.max(...yearButtons.map(btn => parseInt(btn.getAttribute('data-year')) || 0));
  
  const defaultButton = document.querySelector('.research-filters [data-year="' + latestYear + '"]');
  
  if (defaultButton) {
    defaultButton.click();
  }
}

/* Research Description Toggle */

function toggleDescription(button) {
  const wrapper = button.closest('.project-desc-wrapper');
  const preview = wrapper.querySelector('.desc-preview');
  const full = wrapper.querySelector('.desc-full');
  
  if (full.style.display === 'none') {
    // Show full description
    preview.style.display = 'none';
    full.style.display = 'inline';
    button.textContent = 'See less';
  } else {
    // Show preview
    preview.style.display = 'inline';
    full.style.display = 'none';
    button.textContent = 'See more';
  }
}

/* Blogs Category Filtering */

function initBlogsFiltering() {
  const categoryFilterButtons = document.querySelectorAll('.blogs-filters.category-filters .filter-btn');
  const blogItems = document.querySelectorAll('.blog-item');
  
  if (categoryFilterButtons.length === 0 || blogItems.length === 0) {
    return; // No blogs filtering needed
  }
  
  // Category filter event listeners
  categoryFilterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const selectedCategory = this.getAttribute('data-category');
      
      // Update active button
      categoryFilterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Filter blog items
      blogItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (selectedCategory === 'all' || itemCategory === selectedCategory) {
          item.style.display = 'block';
          item.classList.remove('hidden');
          // Re-trigger AOS animation
          if (item.getAttribute('data-aos')) {
            item.classList.add('aos-animate');
          }
        } else {
          item.style.display = 'none';
          item.classList.add('hidden');
        }
      });
    });
  });
  
  // Set default to "All Categories"
  const defaultCategoryButton = document.querySelector('.blogs-filters.category-filters [data-category="all"]');
  
  if (defaultCategoryButton) {
    defaultCategoryButton.click();
  }
}

/* Bug Report Modal */

function initBugReportModal() {
  const bugReportBtn = document.getElementById('bug-report-btn');
  const bugModal = document.getElementById('bug-report-modal');
  const bugModalClose = document.getElementById('bug-modal-close');

  if (!bugReportBtn || !bugModal || !bugModalClose) {
    return; // Elements don't exist
  }

  let originalBodyOverflow = '';

  // Open modal
  bugReportBtn.addEventListener('click', function() {
    // Store the original overflow value
    originalBodyOverflow = document.body.style.overflow || '';
    bugModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  });

  // Close modal function
  function closeModal() {
    bugModal.style.display = 'none';
    // Restore the original overflow value
    document.body.style.overflow = originalBodyOverflow;
  }

  // Close modal events
  bugModalClose.addEventListener('click', closeModal);

  // Close modal when clicking outside
  bugModal.addEventListener('click', function(e) {
    if (e.target === bugModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && bugModal.style.display === 'block') {
      closeModal();
    }
  });
}

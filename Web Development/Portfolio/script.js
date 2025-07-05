const inputs = document.querySelectorAll(".input");

function focusFunc() {
  let parent = this.parentNode;
  parent.classList.add("focus");
}

function blurFunc() {
  let parent = this.parentNode;
  if (this.value == "") {
    parent.classList.remove("focus");
  }
}

inputs.forEach((input) => {
  input.addEventListener("focus", focusFunc);
  input.addEventListener("blur", blurFunc);
});

function openModal() {
  document.getElementById("videoModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("videoModal").style.display = "none";
  document.getElementById("videoFrame").src = document.getElementById("videoFrame").src; // لإيقاف الفيديو عند الإغلاق
}
function redirectTo(url) {
  window.location.href = url;
}



  inputs.forEach(input => {
    // لما المستخدم يكتب أو يسيب الحقل
    input.addEventListener("focus", () => {
      input.parentNode.classList.add("focus");
    });

    input.addEventListener("blur", () => {
      if (input.value === "") {
        input.parentNode.classList.remove("focus");
      }
    });

    // ده مهم جدًا لو الفورم اتفتح وكان فيه بيانات محفوظة
    if (input.value !== "") {
      input.parentNode.classList.add("focus");
    }
  });
 
 // Add smooth hover animations
 document.addEventListener('DOMContentLoaded', function() {
  const supervisorCard = document.querySelector('.supervisor-card');
  const teamCards = document.querySelectorAll('.team-card');
  
  // Add entrance animation
  supervisorCard.style.opacity = '0';
  supervisorCard.style.transform = 'translateY(30px)';
  
  setTimeout(() => {
      supervisorCard.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      supervisorCard.style.opacity = '1';
      supervisorCard.style.transform = 'translateY(0)';
  }, 300);
  
  // Animate team cards
  teamCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
          card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          card.style.opacity = '0.7';
          card.style.transform = 'translateY(0)';
      }, 600 + (index * 100));
  });
});

// 🔥 JavaScript للتحكم في الشريط الجانبي الاحترافي
document.addEventListener("DOMContentLoaded", () => {
  // العناصر
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const mobileSidebar = document.getElementById("mobileSidebar")
  const sidebarOverlay = document.getElementById("sidebarOverlay")
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn")
  const sidebarNavLinks = document.querySelectorAll(".sidebar-nav-link")
  const navbarLinks = document.querySelectorAll(".navbar a")

  // فتح الشريط الجانبي
  function openSidebar() {
    mobileSidebar.classList.add("active")
    sidebarOverlay.classList.add("active")
    mobileMenuBtn.classList.add("active")
    document.body.style.overflow = "hidden"
  }

  // إغلاق الشريط الجانبي
  function closeSidebar() {
    mobileSidebar.classList.remove("active")
    sidebarOverlay.classList.remove("active")
    mobileMenuBtn.classList.remove("active")
    document.body.style.overflow = "auto"
  }

  // أحداث فتح وإغلاق الشريط الجانبي
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", openSidebar)
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", closeSidebar)
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar)
  }

  // إغلاق الشريط الجانبي عند النقر على رابط
  sidebarNavLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      closeSidebar()

      // تحديث الرابط النشط
      const href = this.getAttribute("href")
      updateActiveLink(href)

      // تمرير سلس
      if (href.startsWith("#")) {
        e.preventDefault()
        const targetSection = document.querySelector(href)
        if (targetSection) {
          const headerHeight = document.querySelector(".header").offsetHeight
          const targetPosition = targetSection.offsetTop - headerHeight

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          })
        }
      }
    })
  })

  // تحديث الرابط النشط في الـ navbar العادي
  navbarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href")
      updateActiveLink(href)
    })
  })

  // دالة تحديث الرابط النشط
  function updateActiveLink(href) {
    // إزالة active من جميع الروابط
    ;[...sidebarNavLinks, ...navbarLinks].forEach((link) => {
      link.classList.remove("active")
    })

    // إضافة active للرابط المحدد
    ;[...sidebarNavLinks, ...navbarLinks].forEach((link) => {
      if (link.getAttribute("href") === href) {
        link.classList.add("active")
      }
    })
  }

  // إغلاق الشريط الجانبي بالضغط على مفتاح Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileSidebar && mobileSidebar.classList.contains("active")) {
      closeSidebar()
    }
  })

  // التعامل مع تغيير حجم الشاشة
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && mobileSidebar && mobileSidebar.classList.contains("active")) {
      closeSidebar()
    }
  })

  // تحديث الرابط النشط بناءً على التمرير
  let ticking = false

  function updateActiveOnScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        let current = ""
        const sections = document.querySelectorAll("section[id]")
        const scrollPosition = window.scrollY + 200

        sections.forEach((section) => {
          const sectionTop = section.offsetTop
          const sectionHeight = section.clientHeight

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute("id")
          }
        })

        if (current) {
          updateActiveLink(`#${current}`)
        }

        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener("scroll", updateActiveOnScroll)

  // تأثير الدخول المتدرج للروابط
  function animateLinks() {
    if (mobileSidebar && mobileSidebar.classList.contains("active")) {
      sidebarNavLinks.forEach((link, index) => {
        setTimeout(() => {
          link.style.transform = "translateX(0)"
          link.style.opacity = "1"
        }, index * 100)
      })
    }
  }

  // مراقب التغييرات للشريط الجانبي
  if (mobileSidebar) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          if (mobileSidebar.classList.contains("active")) {
            setTimeout(animateLinks, 100)
          }
        }
      })
    })

    observer.observe(mobileSidebar, {
      attributes: true,
      attributeFilter: ["class"],
    })
  }

  console.log("🔥 Professional Mobile Sidebar loaded successfully!")
})

// Gallery data with local images
const galleryItems = [
  {
      id: 1,
      image: "pcb1.jpg", // ضع صورك المحلية هنا
      
  },
  {
      id: 2,
      image: "pcb2.jpg",
      
  },
  {
      id: 3,
      image: "pcb3.jpg",
      
  },
  {
      id: 4,
      image: "car1.jpg",
      
  },
  {
      id: 5,
      image: "maket3.jpg",
      
  },
  {
      id: 6,
      image: "maket.jpg",
      
  }
];

// State
let isExpanded = false;
let visibleItems = [];

// Initialize gallery
function initGallery() {
  const galleryGrid = document.getElementById('gallery-grid');
  galleryGrid.innerHTML = '';

  galleryItems.forEach((item, index) => {
      const galleryItem = createGalleryItem(item, index);
      galleryGrid.appendChild(galleryItem);
  });

  updateCounter();
}

// Create gallery item
function createGalleryItem(item, index) {
  const div = document.createElement('div');
  div.className = 'gallery-item';
  div.onclick = (e) => toggleImage(e, item.id);

  div.innerHTML = `
      <div class="image-container">
          <img src="${item.image}" alt="${item.title}" class="gallery-image" 
               onerror="this.src='https://via.placeholder.com/400x300/667eea/ffffff?text=صورة+${item.id}'">
         
          
      </div>
  `;

  return div;
}

// Toggle gallery
function toggleGallery() {
  isExpanded = !isExpanded;
  const content = document.getElementById('gallery-content');
  const arrow = document.getElementById('arrow-container');

  if (isExpanded) {
      content.classList.add('expanded');
      arrow.classList.add('rotated');
  } else {
      content.classList.remove('expanded');
      arrow.classList.remove('rotated');
      // Reset when closing
      visibleItems = [];
      setTimeout(() => {
          if (!isExpanded) {
              initGallery();
          }
      }, 300);
  }
}

// Toggle image visibility
/*function toggleImage(event, itemId) {
  event.stopPropagation();
  
  const dot = document.getElementById(`dot-${itemId}`);
  
  if (visibleItems.includes(itemId)) {
      visibleItems = visibleItems.filter(id => id !== itemId);
      dot.classList.remove('visible');
  } else {
      visibleItems.push(itemId);
      dot.classList.add('visible');
  }

  updateCounter();
}
  */

// Update counter
function updateCounter() {
  document.getElementById('visible-count').textContent = visibleItems.length;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initGallery();
});
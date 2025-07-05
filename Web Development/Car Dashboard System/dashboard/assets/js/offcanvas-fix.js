

(function() {
    'use strict';


    function removeOffcanvasBackdrop() {
        try {

            const backdrops = document.querySelectorAll('.offcanvas-backdrop');
            backdrops.forEach(backdrop => {
                backdrop.remove();
            });


            document.body.style.overflow = 'auto';
            document.body.classList.remove('modal-open');


            document.body.style.paddingRight = '';

            console.log('Offcanvas backdrop cleaned up');
        } catch (error) {
            console.warn('Error cleaning offcanvas backdrop:', error);
        }
    }

    function setupOffcanvasEventListeners() {
        const sidebarMenu = document.getElementById('sidebarMenu');
        if (sidebarMenu) {
            sidebarMenu.addEventListener('hidden.bs.offcanvas', function () {
                setTimeout(removeOffcanvasBackdrop, 100);
            });

            sidebarMenu.addEventListener('hide.bs.offcanvas', function () {
                setTimeout(removeOffcanvasBackdrop, 50);
            });

            sidebarMenu.addEventListener('show.bs.offcanvas', function () {
                setTimeout(removeOffcanvasBackdrop, 50);
            });

            console.log('Offcanvas event listeners setup complete');
        }
    }

    function setupBackdropObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('offcanvas-backdrop')) {
                        setTimeout(() => {
                            if (node.parentNode) {
                                node.remove();
                                console.log('Removed newly added backdrop');
                            }
                        }, 10);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('Backdrop observer setup complete');
    }

    function initOffcanvasFix() {
        removeOffcanvasBackdrop();

        setupOffcanvasEventListeners();

        setupBackdropObserver();

        setInterval(removeOffcanvasBackdrop, 2000);

        console.log('Offcanvas fix initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOffcanvasFix);
    } else {
        initOffcanvasFix();
    }

    window.addEventListener('load', function() {
        setTimeout(initOffcanvasFix, 100);
    });

    window.removeOffcanvasBackdrop = removeOffcanvasBackdrop;

})();

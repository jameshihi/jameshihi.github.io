// 確保 Bootstrap 已完全載入
function ensureBootstrapLoaded() {
    return new Promise((resolve, reject) => {
        if (typeof bootstrap !== 'undefined') {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof bootstrap !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            // 10秒後超時
            setTimeout(() => {
                clearInterval(checkInterval);
                reject('Bootstrap loading timeout');
            }, 10000);
        }
    });
}

// 使用 async/await 確保正確的初始化順序
async function initializeModal() {
    try {
        await ensureBootstrapLoaded();
        // 檢查其他必要的插件
        if (typeof jQuery !== 'undefined') {
            console.log('jQuery is loaded');
        }

        // 取得 modal 元素
        const dynamicModal = document.getElementById('dynamicModal');
        if (!dynamicModal) {
            console.error('Modal element not found!');
            return;
        }

        const modalTitle = dynamicModal.querySelector('.modal-title');
        const modalBody = dynamicModal.querySelector('.modal-body');
        
        // SVG 預設圖形
        const svgPlaceholder = `
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" 
                 preserveAspectRatio="xMidYMid slice" focusable="false">
                <rect width="100%" height="100%" fill="#868e96"/>
                <text x="50%" y="50%" fill="#dee2e6" dy=".3em" text-anchor="middle">Loading...</text>
            </svg>`;

        // 建立單一 modal 實例
        const bsModal = new bootstrap.Modal(dynamicModal);

        let isProcessingClick = false;
        const loadedImages = new Set(); // 用於跟踪已加載的圖片

        // 監聽所有具有 data-modal 屬性的按鈕
        document.querySelectorAll('[data-modal="true"]').forEach(button => {
            const clickHandler = async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (isProcessingClick) return;
                isProcessingClick = true;

                try {
                    const title = this.getAttribute('data-modal-title');
                    const contentId = this.getAttribute('data-modal-content');

                    // 先顯示 modal 和載入動畫
                    modalTitle.textContent = title;
                    modalBody.innerHTML = '<div class="loading-spinner">' + svgPlaceholder + '</div>';
                    bsModal.show();

                    // 使用 requestAnimationFrame 確保 DOM 更新
                    requestAnimationFrame(() => {
                        const content = getModalContent(contentId);
                        if (content) {
                            modalBody.innerHTML = content;
                            
                            // 處理所有圖片
                            const images = modalBody.querySelectorAll('img');
                            images.forEach(img => {
                                const originalSrc = img.getAttribute('data-src') || img.src;
                                if (!loadedImages.has(originalSrc)) { // 檢查是否已加載
                                    loadedImages.add(originalSrc); // 標記為已加載
                                    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgPlaceholder)}`;
                                    img.classList.add('lazyload');
                                    img.setAttribute('data-src', originalSrc);
                                    
                                    // 監聽圖片載入
                                    img.addEventListener('load', function() {
                                        this.classList.add('loaded');
                                    });
                                } else {
                                    img.src = originalSrc; // 如果已加載，直接設置原始 src
                                }
                            });

                            // 重新初始化 lazySizes
                            if (window.lazySizes) {
                                lazySizes.init();
                            }
                        }
                    });

                } catch (error) {
                    console.error('Modal error:', error);
                    modalBody.innerHTML = '<p>發生錯誤</p>';
                } finally {
                    isProcessingClick = false;
                }
            };

            // 移除現有的事件監聽器（確保不重複綁定）
            button.removeEventListener('click', clickHandler);
            
            // 添加新的事件監聽器，確保在捕獲階段處理
            button.addEventListener('click', clickHandler, { capture: true });

            // 也處理 mousedown 事件，避免預設行為
            button.addEventListener('mousedown', function(e) {
                e.preventDefault();
            }, { capture: true });
        });
        
        // 監聽 modal 事件
        dynamicModal.addEventListener('shown.bs.modal', function() {
            console.log('Modal shown');
        });

        dynamicModal.addEventListener('hidden.bs.modal', function() {
            console.log('Modal hidden');
            modalBody.innerHTML = '';
            modalTitle.textContent = '';
            
            // 確保重新啟用所有 Swiper
            const swipers = document.querySelectorAll('.swiper-container, .swiper');
            swipers.forEach(container => {
                if (container.swiper) {
                    container.swiper.allowTouchMove = true;
                    container.swiper.attachEvents();
                }
            });
        });

        // 監聽 modal 顯示失敗
        dynamicModal.addEventListener('show.bs.modal', function(event) {
            if (!event) {
                console.error('Modal show event failed');
            }
        });
        
        // 取得 modal 內容的函數
        // 注意：已移除所有內嵌 onload 屬性，避免圖片重複下載
        function getModalContent(id) {
            if (!id) {
                console.error('No content ID provided');
                return null;
            }

            const contents = {
                // 平面視覺設計類
                'drqq': `
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/graphic_design/drqq/drqq-case-1.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/graphic_design/drqq/drqq-case-2.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/graphic_design/drqq/drqq-case-3.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                `,
                'appworks': `
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/graphic_design/appworks/appworks-case-1.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                `,
                'qrcode': `
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/graphic_design/qrcode/qrcode-case-1.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/graphic_design/qrcode/qrcode-case-2.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                `,
                'wedding_illustrated': `
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/graphic_design/wedding_illustrated/illustrated-1.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                `,
                'qlandGraphic': `
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/graphic_design/qland/qland-1.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                `,

                // UI/UX設計類
                'qlandWeb': `
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/qland/qland-case-1.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/qland/qland-case-2.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/qland/qland-case-3.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/qland/qland-case-4.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                `,
                'invoicePlus': `
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/invoiceplus/invoiceplus-case-1.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/invoiceplus/invoiceplus-case-2.png" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/invoiceplus/invoiceplus-case-3.png" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                `,
                'mozbii': `
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/mozbii/mozbii-case-1.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/mozbii/mozbii-case-2.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/mozbii/mozbii-case-3.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/mozbii/mozbii-case-4.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/mozbii/mozbii-case-5.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                `,
                'medLecture': `
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/medlecture/medlecture-case-1.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/medlecture/medlecture-case-2.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase lazyload" data-src="images/design_portfolio/uiux/medlecture/medlecture-case-3.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                `,

                // 攝影類（以下僅示範部分，其他項目同理移除 inline onload）
                'hylerwoods': `
                    <img class="img-showcase-photo lazyload" data-src="images/design_portfolio/photography/hylerwoods/photo_001.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <img class="img-showcase-photo lazyload" data-src="images/design_portfolio/photography/hylerwoods/photo_002.jpg" src="data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'><rect width='100%' height='100%' fill='#cccccc'/></svg>">
                    <!-- 其他圖片請依此模式調整 -->
                `,
                // 其他分類同理……
                'drqqPhotography': `...`,
                'wedding': `...`,
                'rose': `...`
            };
            
            return contents[id] || null;
        }
    } catch (error) {
        console.error('Failed to initialize modal:', error);
    }
}

function loadImage(imageUrl) {
    // 顯示 SVG 圖案
    const svgPlaceholder = document.createElement('div');
    svgPlaceholder.innerHTML = '<svg>...</svg>'; // 在這裡插入您的 SVG 代碼
    document.body.appendChild(svgPlaceholder); // 將 SVG 插入到 DOM 中

    console.log('SVG placeholder displayed'); // 添加日誌輸出

    const img = new Image();
    img.src = imageUrl;

    img.onload = function() {
        // 圖片加載完成後，隱藏 SVG 圖案
        document.body.removeChild(svgPlaceholder);
        document.body.appendChild(img); // 將圖片添加到 DOM 中
    };

    img.onerror = function() {
        // 處理加載錯誤
        console.error('Image failed to load');
        document.body.removeChild(svgPlaceholder); // 隱藏 SVG 圖案
    };
}

// 啟動初始化
window.addEventListener('load', initializeModal);

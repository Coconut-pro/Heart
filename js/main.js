/**
 * 心脏血液循环动画控制器
 * 负责管理心脏收缩舒张动画和血液流动效果
 */
class HeartCirculationController {
    constructor() {
        this.isAnimating = false;
        this.currentState = 'static'; // static, contracting, relaxing
        this.bloodParticles = [];
        this.animationTimeouts = [];



        this.init();
    }

    /**
     * 初始化控制器
     */
    init() {
        this.bindEvents();
        this.createBloodParticles();
        this.updateStatus('静止');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        const contractionBtn = document.getElementById('contractionBtn');
        const relaxationBtn = document.getElementById('relaxationBtn');

        if (contractionBtn && relaxationBtn) {
            contractionBtn.addEventListener('click', () => {
                console.log('心脏收缩按钮被点击');
                this.startContraction();
            });
            relaxationBtn.addEventListener('click', () => {
                console.log('心脏舒张按钮被点击');
                this.startRelaxation();
            });

            console.log('事件监听器绑定成功');
        } else {
            console.error('找不到按钮元素');
        }
    }

    /**
     * 创建血液粒子元素
     */
    createBloodParticles() {
        const svg = document.getElementById('circulationSVG');
        const bloodFlowGroup = document.getElementById('bloodFlow');
        
        // 清除现有粒子
        bloodFlowGroup.innerHTML = '';

        // 动脉血流粒子路径 - 使用用户长按拖拽绘制的完整路径网络
        const arteryPaths = [
            '#artery-systemic',
            '#artery-liver',
            '#artery-kidneys',
            '#artery-brain',
            '#artery-pulmonary-main',
            '#artery-pulmonary-branch',
            '#artery-arms',
            '#artery-left-branch',
            '#artery-right-branch'
        ];

        // 静脉血流粒子路径 - 使用用户长按拖拽绘制的完整路径网络
        const veinPaths = [
            '#vein-arms',
            '#vein-legs',
            '#vein-kidneys',
            '#vein-liver',
            '#vein-lungs-1',
            '#vein-lungs-2'
        ];

        // 创建动脉血流粒子 - 根据路径重要性分配粒子数量
        arteryPaths.forEach((pathId, index) => {
            let particleCount = 6; // 默认粒子数量

            // 根据路径类型调整粒子数量
            if (pathId.includes('systemic')) particleCount = 12; // 主要体循环
            else if (pathId.includes('brain')) particleCount = 8; // 大脑供血
            else if (pathId.includes('liver') || pathId.includes('kidneys')) particleCount = 7; // 重要器官
            else if (pathId.includes('pulmonary')) particleCount = 8; // 肺循环
            else if (pathId.includes('arms')) particleCount = 7; // 上肢循环

            for (let i = 0; i < particleCount; i++) {
                const particle = this.createBloodParticle('artery', pathId, i * 0.25);
                bloodFlowGroup.appendChild(particle);
                this.bloodParticles.push(particle);
            }
        });

        // 创建静脉血流粒子 - 根据路径重要性分配粒子数量
        veinPaths.forEach((pathId, index) => {
            let particleCount = 6; // 默认粒子数量

            // 根据路径类型调整粒子数量
            if (pathId.includes('legs')) particleCount = 10; // 下肢回流（最重要）
            else if (pathId.includes('arms')) particleCount = 9; // 上肢回流
            else if (pathId.includes('liver') || pathId.includes('kidneys')) particleCount = 7; // 器官回流
            else if (pathId.includes('lungs')) particleCount = 8; // 肺静脉回流

            for (let i = 0; i < particleCount; i++) {
                const particle = this.createBloodParticle('vein', pathId, i * 0.25);
                bloodFlowGroup.appendChild(particle);
                this.bloodParticles.push(particle);
            }
        });
    }

    /**
     * 创建单个血液粒子
     */
    createBloodParticle(type, pathId, delay) {
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        particle.setAttribute('r', '6');
        particle.setAttribute('fill', type === 'artery' ? 'url(#bloodParticle)' : 'url(#bloodParticleBlue)');
        particle.classList.add('blood-particle', `${type}-flow`);

        // 添加发光效果
        particle.setAttribute('filter', 'url(#glow)');

        // 创建动画元素
        const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        animateMotion.setAttribute('dur', '3s');
        animateMotion.setAttribute('repeatCount', 'indefinite');
        animateMotion.setAttribute('begin', `${delay}s`);

        const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
        mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', pathId);

        animateMotion.appendChild(mpath);
        particle.appendChild(animateMotion);

        return particle;
    }

    /**
     * 开始心脏收缩动画
     */
    startContraction() {
        console.log('开始心脏收缩动画');
        if (this.isAnimating) {
            console.log('动画正在进行中，跳过');
            return;
        }

        this.isAnimating = true;
        this.currentState = 'contracting';
        this.updateStatus('心脏收缩中...');

        // 添加按钮动画效果
        const contractionBtn = document.getElementById('contractionBtn');
        if (contractionBtn) {
            contractionBtn.classList.add('active');
        }

        // 显示动脉血流（血液流出心脏）
        this.showArterialFlow();

        // 隐藏静脉血流
        this.hideVenousFlow();

        // 显示心脏跳动指示器
        const heartIndicator = document.getElementById('heartIndicator');
        if (heartIndicator) {
            heartIndicator.style.display = 'block';
        }

        // 动画结束后重置状态
        setTimeout(() => {
            if (contractionBtn) {
                contractionBtn.classList.remove('active');
            }
            this.isAnimating = false;
            this.currentState = 'static';
            this.updateStatus('收缩完成');
            console.log('心脏收缩动画完成');
        }, 3000);
    }

    /**
     * 开始心脏舒张动画
     */
    startRelaxation() {
        console.log('开始心脏舒张动画');
        if (this.isAnimating) {
            console.log('动画正在进行中，跳过');
            return;
        }

        this.isAnimating = true;
        this.currentState = 'relaxing';
        this.updateStatus('心脏舒张中...');

        // 添加按钮动画效果
        const relaxationBtn = document.getElementById('relaxationBtn');
        if (relaxationBtn) {
            relaxationBtn.classList.add('active');
        }

        // 显示静脉血流（血液流回心脏）
        this.showVenousFlow();

        // 隐藏动脉血流
        this.hideArterialFlow();

        // 显示心脏跳动指示器
        const heartIndicator = document.getElementById('heartIndicator');
        if (heartIndicator) {
            heartIndicator.style.display = 'block';
        }

        // 动画结束后重置状态
        setTimeout(() => {
            if (relaxationBtn) {
                relaxationBtn.classList.remove('active');
            }
            this.isAnimating = false;
            this.currentState = 'static';
            this.updateStatus('舒张完成');
            console.log('心脏舒张动画完成');
        }, 3000);
    }

    /**
     * 显示动脉血流
     */
    showArterialFlow() {
        const arterialParticles = document.querySelectorAll('.artery-flow');
        arterialParticles.forEach(particle => {
            particle.classList.add('active');
        });

        // 高亮动脉血管
        const arteries = document.querySelectorAll('#arteries path');
        arteries.forEach(artery => {
            artery.classList.add('highlight-red');
        });
    }

    /**
     * 隐藏动脉血流
     */
    hideArterialFlow() {
        const arterialParticles = document.querySelectorAll('.artery-flow');
        arterialParticles.forEach(particle => {
            particle.classList.remove('active');
        });

        // 重置动脉血管样式
        const arteries = document.querySelectorAll('#arteries path');
        arteries.forEach(artery => {
            artery.classList.remove('highlight-red');
        });
    }

    /**
     * 显示静脉血流
     */
    showVenousFlow() {
        const venousParticles = document.querySelectorAll('.vein-flow');
        venousParticles.forEach(particle => {
            particle.classList.add('active');
        });

        // 高亮静脉血管
        const veins = document.querySelectorAll('#veins path');
        veins.forEach(vein => {
            vein.classList.add('highlight-blue');
        });
    }

    /**
     * 隐藏静脉血流
     */
    hideVenousFlow() {
        const venousParticles = document.querySelectorAll('.vein-flow');
        venousParticles.forEach(particle => {
            particle.classList.remove('active');
        });

        // 重置静脉血管样式
        const veins = document.querySelectorAll('#veins path');
        veins.forEach(vein => {
            vein.classList.remove('highlight-blue');
        });
    }

    /**
     * 更新状态显示
     */
    updateStatus(status) {
        const statusElement = document.getElementById('currentStatus');
        statusElement.textContent = status;
        
        // 添加状态变化动画
        statusElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            statusElement.style.transform = 'scale(1)';
        }, 200);
    }



    /**
     * 清理所有动画
     */
    cleanup() {
        console.log('清理所有动画');
        this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
        this.animationTimeouts = [];

        // 重置所有动画状态
        this.hideArterialFlow();
        this.hideVenousFlow();

        // 重置按钮状态
        const contractionBtn = document.getElementById('contractionBtn');
        const relaxationBtn = document.getElementById('relaxationBtn');
        if (contractionBtn) contractionBtn.classList.remove('active');
        if (relaxationBtn) relaxationBtn.classList.remove('active');

        this.isAnimating = false;
        this.currentState = 'static';
        this.updateStatus('静止');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const controller = new HeartCirculationController();
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', (event) => {
        if (event.key === '1' || event.key === 'c') {
            controller.startContraction();
        } else if (event.key === '2' || event.key === 'r') {
            controller.startRelaxation();
        } else if (event.key === 'Escape') {
            controller.cleanup();
        }
    });
    
    // 添加窗口大小变化处理
    window.addEventListener('resize', () => {
        // 重新计算SVG尺寸
        const svg = document.getElementById('circulationSVG');
        svg.style.width = '100%';
        svg.style.height = 'auto';
    });
    
    console.log('心脏血液循环系统已初始化');
    console.log('快捷键: 1或C - 心脏收缩, 2或R - 心脏舒张, ESC - 重置');
});

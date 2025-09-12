/**
 * 极客风格个人网站脚本
 */

document.addEventListener("DOMContentLoaded", function () {
  // 从配置加载数据
  loadConfigData();

  // 导航栏滚动效果
  setupNavbar();

  // 移动端导航栏
  setupMobileNav();

  // 技能条动画
  setupSkillBars();

  // 返回顶部按钮
  setupBackToTop();

  // 联系表单处理
  setupContactForm();

  // 终端打字效果
  setupTypingEffect();

  // 设置当前年份
  document.getElementById("current-year").textContent =
    new Date().getFullYear();

  // 鼠标跟随效果
  setupCursorFollower();

  // 设置开发者工具检测
  setupDevToolsDetection();

  // 加载GitHub置顶项目
  loadGitHubPinnedRepos();

  // 获取访客地理位置信息
  fetchVisitorLocation();
});

/**
 * 从配置文件加载数据到页面元素
 */
function loadConfigData() {
  try {
    // 基本信息
    setElementText("dev-name", websiteConfig.basics.devName);
    setElementText("name", websiteConfig.basics.name);
    setElementText("title", websiteConfig.basics.title);
    setElementText("location", websiteConfig.basics.location);
    setElementText("education", websiteConfig.basics.education);
    setElementText("experience", websiteConfig.basics.experience);
    setElementText("status-message", websiteConfig.basics.status);
    setElementText("email", websiteConfig.basics.email);
    setElementText("github", websiteConfig.basics.github);
    setElementText("linkedin", websiteConfig.basics.linkedin);
    setElementText("wechat", websiteConfig.basics.wechat);
    setElementText("footer-name", websiteConfig.basics.name);

    // 个人照片
    setImageSrc("profile-img", websiteConfig.profileImage);

    // GitHub相关信息
    setElementText("github-name", websiteConfig.basics.name);
    setElementText(
      "github-username",
      websiteConfig.basics.github.replace("github.com/", "")
    );

    const githubFollowBtn = document.getElementById("github-follow");
    if (githubFollowBtn) {
      githubFollowBtn.href = websiteConfig.basics.githubUrl;
    }

    const githubProfileLink = document.getElementById("github-profile-link");
    if (githubProfileLink) {
      githubProfileLink.href = websiteConfig.basics.githubUrl;
    }

    // 技能
    setElementText("skills", formatSkillsArray(websiteConfig.skills));

    // 加载项目数据
    loadProjects();

    // 加载博客文章
    loadBlogPosts();

    // 设置社交媒体链接
    setupSocialLinks();
  } catch (error) {
    console.error("Error loading config data:", error);
  }
}

/**
 * 将技能数组格式化为终端风格显示
 */
function formatSkillsArray(skills) {
  return "[ '" + skills.join("', '") + "' ]";
}

/**
 * 设置元素文本内容的辅助函数
 */
function setElementText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

/**
 * 设置图片src属性的辅助函数
 */
function setImageSrc(id, src) {
  const element = document.getElementById(id);
  if (element) {
    element.src = src;
  }
}

/**
 * 加载项目数据到页面
 */
function loadProjects() {
  const projectsGrid = document.querySelector(".projects-grid");
  if (!projectsGrid) return;

  // 清空现有项目
  projectsGrid.innerHTML = "";

  // 添加配置的项目
  websiteConfig.projects.forEach((project) => {
    const projectCard = document.createElement("div");
    projectCard.className = "project-card";

    projectCard.innerHTML = `
            <div class="project-header">
                <div class="folder-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="project-links">
                    <a href="${
                      project.githubUrl
                    }" target="_blank"><i class="fab fa-github"></i></a>
                    <a href="${
                      project.liveUrl
                    }" target="_blank"><i class="fas fa-external-link-alt"></i></a>
                </div>
            </div>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
                ${project.technologies
                  .map((tech) => `<span>${tech}</span>`)
                  .join("")}
            </div>
        `;

    projectsGrid.appendChild(projectCard);
  });
}

/**
 * 加载博客文章到页面
 */
function loadBlogPosts() {
  const blogPostsContainer = document.querySelector(".blog-posts");
  if (!blogPostsContainer) return;

  // 清空现有博客文章
  blogPostsContainer.innerHTML = "";

  // 添加配置的博客文章
  websiteConfig.blogPosts.forEach((post) => {
    const blogPost = document.createElement("div");
    blogPost.className = "blog-post";

    blogPost.innerHTML = `
            <div class="post-date">
                <span class="day">${post.date.day}</span>
                <span class="month">${post.date.month}</span>
                <span class="year">${post.date.year}</span>
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-tags">
                    ${post.tags.map((tag) => `<span>${tag}</span>`).join("")}
                </div>
                <a href="${
                  post.url
                }" class="read-more">阅读全文 <i class="fas fa-chevron-right"></i></a>
            </div>
        `;

    blogPostsContainer.appendChild(blogPost);
  });
}

/**
 * 设置社交媒体链接
 */
function setupSocialLinks() {
  const socialLinks = document.querySelectorAll(".footer-social a");

  if (socialLinks.length >= 4) {
    socialLinks[0].href = websiteConfig.socialLinks.github;
    socialLinks[1].href = websiteConfig.socialLinks.twitter;
    socialLinks[2].href = websiteConfig.socialLinks.linkedin;
    socialLinks[3].href = websiteConfig.socialLinks.weixin;
  }

  // 设置联系区域的链接
  const githubLink = document.getElementById("github");
  if (githubLink) {
    githubLink.href = websiteConfig.socialLinks.github;
  }

  const linkedinLink = document.getElementById("linkedin");
  if (linkedinLink) {
    linkedinLink.href = websiteConfig.socialLinks.linkedin;
  }
}

/**
 * 导航栏滚动效果
 */
function setupNavbar() {
  const navbar = document.querySelector(".navbar");
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-links a");

  // 滚动效果
  window.addEventListener("scroll", () => {
    // 滚动后导航栏样式变化
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    // 获取当前滚动位置，为对应的导航项添加active类
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // 平滑滚动到锚点
  document.querySelectorAll(".nav-links a, .logo a").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (href.startsWith("#")) {
        e.preventDefault();

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: "smooth",
          });

          // 为点击的导航项添加active类
          navLinks.forEach((link) => link.classList.remove("active"));
          this.classList.add("active");

          // 如果移动菜单打开，关闭它
          const navLinks = document.querySelector(".nav-links");
          const burger = document.querySelector(".burger");
          if (navLinks.classList.contains("active")) {
            navLinks.classList.remove("active");
            burger.classList.remove("active");
          }
        }
      }
    });
  });

  // 初始加载时检查当前位置并设置对应的导航项为active
  function setActiveNavOnLoad() {
    let scrollPosition = window.scrollY;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (
        scrollPosition >= sectionTop - 200 &&
        scrollPosition < sectionTop + sectionHeight - 200
      ) {
        const currentId = section.getAttribute("id");

        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${currentId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  // 页面加载后设置当前活动导航项
  setActiveNavOnLoad();
}

/**
 * 设置移动端导航
 */
function setupMobileNav() {
  const burger = document.querySelector(".burger");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-links li");
  const body = document.body;

  // 汉堡菜单点击事件
  burger.addEventListener("click", () => {
    // 切换导航菜单显示状态
    navLinks.classList.toggle("active");
    burger.classList.toggle("active");

    // 禁用/启用背景滚动
    if (navLinks.classList.contains("active")) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = "auto";

      // 重置动画延迟以便下次打开有正确的动画效果
      setTimeout(() => {
        navItems.forEach((item) => {
          item.style.transitionDelay = "0s";
        });
      }, 500);
    }
  });

  // 点击导航链接后关闭菜单
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        burger.classList.remove("active");
        body.style.overflow = "auto";
      }
    });
  });

  // 点击页面其他部分关闭菜单
  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("active") &&
      !navLinks.contains(e.target) &&
      !burger.contains(e.target)
    ) {
      navLinks.classList.remove("active");
      burger.classList.remove("active");
      body.style.overflow = "auto";
    }
  });

  // 监听窗口大小变化，在大屏幕下自动关闭移动菜单
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
      burger.classList.remove("active");
      body.style.overflow = "auto";
    }
  });
}

/**
 * 技能条动画
 */
function setupSkillBars() {
  const skillLevels = document.querySelectorAll(".skill-level");

  // 初始设置为0宽度
  skillLevels.forEach((skill) => {
    skill.style.width = "0%";
  });

  // 监听滚动来触发动画
  const skillsSection = document.getElementById("skills-section");

  if (skillsSection) {
    const animateSkills = () => {
      const sectionTop = skillsSection.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (sectionTop < windowHeight * 0.75) {
        // 当滚动到技能部分时，设置宽度为实际值
        skillLevels.forEach((skill) => {
          const width = skill.textContent;
          skill.style.width = width;
        });
        window.removeEventListener("scroll", animateSkills);
      }
    };

    window.addEventListener("scroll", animateSkills);
    // 首次加载检查
    animateSkills();
  }
}

/**
 * 返回顶部按钮
 */
function setupBackToTop() {
  const backToTopButton = document.getElementById("back-to-top");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("show");
    } else {
      backToTopButton.classList.remove("show");
    }
  });

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/**
 * 联系表单处理
 */
function setupContactForm() {
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // 获取表单数据
      const name = document.getElementById("contact-name").value;
      const email = document.getElementById("contact-email").value;
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value;

      // 这里可以添加表单验证

      // 模拟表单提交
      alert(
        `感谢您的消息！\n姓名: ${name}\n邮箱: ${email}\n主题: ${subject}\n消息: ${message}\n\n`
      );

      // 重置表单
      contactForm.reset();
    });
  }
}

/**
 * 终端打字效果
 */
function setupTypingEffect() {
  const typingElement = document.querySelector(".typing-animation");

  if (typingElement) {
    const commands = [
      'echo "Hello World!"',
      "npm run build",
      "git push origin main",
      "python -m venv env",
      "docker-compose up -d",
    ];

    let currentCommandIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let deletingSpeed = 50;
    let pauseBeforeDelete = 2000;
    let pauseBeforeTyping = 500;

    function type() {
      const currentCommand = commands[currentCommandIndex];

      if (isDeleting) {
        // 删除效果
        typingElement.textContent = currentCommand.substring(
          0,
          currentCharIndex - 1
        );
        currentCharIndex--;
        setTimeout(type, deletingSpeed);

        if (currentCharIndex === 0) {
          isDeleting = false;
          currentCommandIndex = (currentCommandIndex + 1) % commands.length;
          setTimeout(type, pauseBeforeTyping);
        }
      } else {
        // 打字效果
        typingElement.textContent = currentCommand.substring(
          0,
          currentCharIndex + 1
        );
        currentCharIndex++;

        if (currentCharIndex === currentCommand.length) {
          isDeleting = true;
          setTimeout(type, pauseBeforeDelete);
        } else {
          setTimeout(type, typingSpeed);
        }
      }
    }

    // 开始打字效果
    setTimeout(type, pauseBeforeTyping);
  }
}

/**
 * 设置鼠标跟随效果
 */
function setupCursorFollower() {
  const cursor = document.querySelector(".cursor-follower");

  if (!cursor) return;

  // 检查是否为移动设备，如果是则隐藏自定义鼠标
  if (isMobileDevice()) {
    cursor.style.display = "none";
    return;
  }

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

  // 鼠标进入可点击元素时的效果
  const interactiveElements = document.querySelectorAll(
    "a, button, .btn, .project-card, .blog-post, .terminal-button, .burger"
  );

  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("active");
    });

    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("active");
    });
  });

  // 鼠标离开页面时隐藏
  document.addEventListener("mouseout", (e) => {
    if (e.relatedTarget === null) {
      cursor.classList.add("hidden");
    }
  });

  // 鼠标进入页面时显示
  document.addEventListener("mouseover", () => {
    cursor.classList.remove("hidden");
  });

  // 点击效果
  document.addEventListener("mousedown", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(0.8)";
  });

  document.addEventListener("mouseup", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
  });
}

/**
 * 检测是否为移动设备
 */
function isMobileDevice() {
  return (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  );
}

/**
 * scrollToContact 函数，用于个人信息代码块中的联系方法
 */
function scrollToContact() {
  const contactSection = document.getElementById("contact");

  if (contactSection) {
    window.scrollTo({
      top: contactSection.offsetTop - 70,
      behavior: "smooth",
    });
  }
}

/**
 * 设置开发者工具检测
 */
function setupDevToolsDetection() {
  // 检测F12键按下
  window.addEventListener("keydown", function (event) {
    // F12键的keyCode是123
    if (event.keyCode === 123) {
      event.preventDefault();
      activateHackerEffect();
      return false;
    }

    // Ctrl+Shift+I 组合键检测 (Chrome, Firefox)
    if (
      (event.ctrlKey && event.shiftKey && event.keyCode === 73) ||
      // Ctrl+Shift+J 组合键检测 (Chrome)
      (event.ctrlKey && event.shiftKey && event.keyCode === 74) ||
      // Ctrl+Shift+C 组合键检测 (Chrome)
      (event.ctrlKey && event.shiftKey && event.keyCode === 67)
    ) {
      event.preventDefault();
      activateHackerEffect();
      return false;
    }
  });

  // // 使用多种方法检测开发者工具
  // // 方法1：检测窗口大小变化（当开发者工具打开时，常会改变窗口大小）
  // let devToolsOpened = false;
  // const threshold = 160;
  // const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  // const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  // if (widthThreshold || heightThreshold) {
  //   if (!devToolsOpened) {
  //     devToolsOpened = true;
  //     activateHackerEffect();
  //   }
  // }

  // // 方法2：定时检测窗口属性
  // setInterval(function () {
  //   const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  //   const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  //   if (widthThreshold || heightThreshold) {
  //     if (!devToolsOpened) {
  //       devToolsOpened = true;
  //       activateHackerEffect();
  //     }
  //   } else {
  //     devToolsOpened = false;
  //   }
  // }, 1000);

  // // 方法3：通过devtools事件检测 (仅Chrome)
  // if (typeof window.chrome !== "undefined") {
  //   const devtools = {
  //     isOpen: false,
  //     orientation: undefined,
  //   };

  //   // 检测 DevTools 方向变化
  //   const emitEvent = (isOpen, orientation) => {
  //     if (isOpen && !devtools.isOpen) {
  //       activateHackerEffect();
  //     }

  //     devtools.isOpen = isOpen;
  //     devtools.orientation = orientation;
  //   };

  //   // 检测devtools的打开状态
  //   const main = ({ emitEvents = true } = {}) => {
  //     const threshold = 160;
  //     const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  //     const heightThreshold =
  //       window.outerHeight - window.innerHeight > threshold;
  //     const orientation = widthThreshold ? "vertical" : "horizontal";

  //     if (
  //       !(heightThreshold && widthThreshold) &&
  //       ((window.Firebug &&
  //         window.Firebug.chrome &&
  //         window.Firebug.chrome.isInitialized) ||
  //         widthThreshold ||
  //         heightThreshold)
  //     ) {
  //       if (emitEvents) {
  //         emitEvent(true, orientation);
  //       }
  //       return true;
  //     }

  //     if (emitEvents) {
  //       emitEvent(false, undefined);
  //     }
  //     return false;
  //   };

  //   window.addEventListener("resize", main);
  //   main();
  // }

  // 方法4: 添加控制台警告消息
  consoleWarning();
}

/**
 * 控制台警告消息
 */
function consoleWarning() {
  // 控制台警告样式
  const cssStyle = `
    font-size: 20px;
    font-family: monospace;
    background: black;
    display: inline-block;
    color: #00ff00;
    padding: 10px;
    border: 2px solid #00ff00;
  `;

  const hackingStyle = `
    font-size: 50px;
    font-weight: bold;
    color: red;
    text-shadow: 0 0 5px #fff;
  `;

  // 添加ASCII艺术文本
  const asciiArt = `
     _   _          _____ _  ________ _____  
    | | | |   /\\   / ____| |/ /  ____|  __ \\ 
    | |_| |  /  \\ | |    | ' /| |__  | |  | |
    |  _  | / /\\ \\| |    |  < |  __| | |  | |
    | | | |/ ____ \\ |____| . \\| |____| |__| |
    |_| |_/_/    \\_\\_____|_|\\_\\______|_____/ 
                                             
  `;

  // 警告和恐吓文本
  console.log("%c" + asciiArt, cssStyle);
  console.log("%c⚠️ 警告: 这是浏览器的开发者功能!", hackingStyle);
  console.log(
    "%c如果有人告诉你在这里粘贴代码可以黑客攻击或解锁功能，那是骗局!",
    cssStyle
  );
  console.log(
    "%c粘贴代码可能会使他们能够窃取您的信息或危害您的设备!",
    cssStyle
  );
}

/**
 * 极客黑客效果 - 当开发者工具打开时激活
 */
function activateHackerEffect() {
  // 创建黑客攻击效果容器
  if (document.getElementById("hacker-effect")) return;

  const hackerEffectContainer = document.createElement("div");
  hackerEffectContainer.id = "hacker-effect";
  hackerEffectContainer.style.position = "fixed";
  hackerEffectContainer.style.top = "0";
  hackerEffectContainer.style.left = "0";
  hackerEffectContainer.style.width = "100%";
  hackerEffectContainer.style.height = "100%";
  hackerEffectContainer.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  hackerEffectContainer.style.zIndex = "99999";
  hackerEffectContainer.style.display = "flex";
  hackerEffectContainer.style.flexDirection = "column";
  hackerEffectContainer.style.justifyContent = "center";
  hackerEffectContainer.style.alignItems = "center";
  hackerEffectContainer.style.fontFamily = "var(--font-mono)";
  hackerEffectContainer.style.color = "var(--primary-color)";
  hackerEffectContainer.style.overflow = "hidden";

  // 创建终端窗口
  const terminalWindow = document.createElement("div");
  terminalWindow.style.width = "80%";
  terminalWindow.style.maxWidth = "800px";
  terminalWindow.style.backgroundColor = "#111";
  terminalWindow.style.borderRadius = "5px";
  terminalWindow.style.boxShadow = "0 0 20px var(--primary-color)";
  terminalWindow.style.overflow = "hidden";

  // 终端头部
  const terminalHeader = document.createElement("div");
  terminalHeader.style.backgroundColor = "#222";
  terminalHeader.style.padding = "10px";
  terminalHeader.style.display = "flex";
  terminalHeader.style.alignItems = "center";
  terminalHeader.style.borderBottom = "1px solid #333";

  const terminalTitle = document.createElement("div");
  terminalTitle.textContent = "root@hacker:~# SECURITY_BREACH_DETECTED";
  terminalTitle.style.color = "#ff5277";
  terminalTitle.style.fontWeight = "bold";

  terminalHeader.appendChild(terminalTitle);
  terminalWindow.appendChild(terminalHeader);

  // 终端内容
  const terminalContent = document.createElement("div");
  terminalContent.style.padding = "20px";
  terminalContent.style.height = "300px";
  terminalContent.style.overflow = "auto";

  terminalWindow.appendChild(terminalContent);
  hackerEffectContainer.appendChild(terminalWindow);

  // 添加到页面
  document.body.appendChild(hackerEffectContainer);

  // 禁用滚动
  document.body.style.overflow = "hidden";

  // 执行打字动画
  const messages = [
    { text: "> 检测到未授权的开发者工具使用...", delay: 100 },
    { text: "> 正在启动安全协议...", delay: 1000 },
    { text: "> 收集用户信息...", delay: 1500 },
    { text: `> 用户代理: ${navigator.userAgent}`, delay: 2000 },
    { text: `> IP地址: ⬛⬛.⬛⬛.⬛⬛.⬛⬛ (已加密)`, delay: 2500 },
    { text: "> 系统漏洞扫描中...", delay: 3000 },
    { text: "> 发现多个漏洞!", delay: 4000 },
    { text: "> 正在运行 HACKER.EXE...", delay: 4500 },
    { text: "> 正在植入虚拟病毒(开玩笑的)...", delay: 5500 },
    { text: "> 这只是一个恶作剧! 😄", delay: 7000 },
    { text: "> 我们注意到您打开了开发者工具", delay: 8000 },
    { text: "> 作为一名尊重极客精神的开发者...", delay: 9000 },
    { text: "> 我们欢迎您探索网站代码", delay: 10000 },
    { text: "> 祝您有一个愉快的调试体验!", delay: 11000 },
    { text: "> 5秒后返回网站...", delay: 12000 },
  ];

  let lineCount = 0;

  messages.forEach((message) => {
    setTimeout(() => {
      const line = document.createElement("div");
      line.style.marginBottom = "10px";

      // 打字效果
      typeText(line, message.text, 0, 30);

      terminalContent.appendChild(line);
      terminalContent.scrollTop = terminalContent.scrollHeight;

      lineCount++;
      if (lineCount === messages.length) {
        // 最后一条消息后添加关闭按钮
        setTimeout(() => {
          const closeButton = document.createElement("button");
          closeButton.textContent = "点击关闭";
          closeButton.style.backgroundColor = "var(--primary-color)";
          closeButton.style.color = "#111";
          closeButton.style.border = "none";
          closeButton.style.padding = "10px 20px";
          closeButton.style.borderRadius = "4px";
          closeButton.style.cursor = "pointer";
          closeButton.style.fontFamily = "var(--font-mono)";
          closeButton.style.fontWeight = "bold";
          closeButton.style.marginTop = "20px";

          closeButton.addEventListener("click", () => {
            document.body.removeChild(hackerEffectContainer);
            document.body.style.overflow = "auto";
          });

          hackerEffectContainer.appendChild(closeButton);

          // 5秒后自动关闭
          setTimeout(() => {
            if (document.body.contains(hackerEffectContainer)) {
              document.body.removeChild(hackerEffectContainer);
              document.body.style.overflow = "auto";
            }
          }, 5000);
        }, 1000);
      }
    }, message.delay);
  });

  // 添加故障效果
  createGlitchEffect(hackerEffectContainer);
}

/**
 * 文字打字效果
 */
function typeText(element, text, index, speed) {
  if (index < text.length) {
    element.textContent += text.charAt(index);
    setTimeout(() => {
      typeText(element, text, index + 1, speed);
    }, Math.random() * speed + 10);
  }
}

/**
 * 创建故障效果
 */
function createGlitchEffect(container) {
  // 随机故障时间
  setInterval(() => {
    if (!document.body.contains(container)) return;

    container.style.transform = `translate(${Math.random() * 10 - 5}px, ${
      Math.random() * 10 - 5
    }px)`;
    container.style.filter = `hue-rotate(${Math.random() * 360}deg)`;

    setTimeout(() => {
      if (!document.body.contains(container)) return;
      container.style.transform = "translate(0, 0)";
      container.style.filter = "hue-rotate(0deg)";
    }, 100);
  }, 2000);

  // 添加随机噪点
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.style.position = "absolute";
  noiseCanvas.style.top = "0";
  noiseCanvas.style.left = "0";
  noiseCanvas.style.width = "100%";
  noiseCanvas.style.height = "100%";
  noiseCanvas.style.pointerEvents = "none";
  noiseCanvas.style.opacity = "0.1";
  noiseCanvas.style.mixBlendMode = "overlay";

  container.appendChild(noiseCanvas);

  const ctx = noiseCanvas.getContext("2d");
  noiseCanvas.width = window.innerWidth;
  noiseCanvas.height = window.innerHeight;

  function drawNoise() {
    if (!document.body.contains(container)) return;

    const imageData = ctx.createImageData(
      noiseCanvas.width,
      noiseCanvas.height
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = Math.random() * 50;
    }

    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(drawNoise);
  }

  drawNoise();
}

/**
 * 加载GitHub置顶项目
 */
function loadGitHubPinnedRepos() {
  const reposGrid = document.querySelector(".github-repos-grid");
  if (!reposGrid) return;

  // 清空现有项目
  reposGrid.innerHTML = "";

  // 添加配置的GitHub置顶项目
  websiteConfig.githubPinnedRepos.forEach((repo) => {
    const repoCard = document.createElement("div");
    repoCard.className = "github-repo-card";

    // 构建卡片内容
    repoCard.innerHTML = `
            <div class="repo-header">
                <a href="${repo.repoUrl}" class="repo-name" target="_blank">
                    <i class="far fa-folder"></i> ${repo.name}
                </a>
                <div class="repo-links">
                    ${
                      repo.demoUrl
                        ? `<a href="${repo.demoUrl}" target="_blank" title="在线演示"><i class="fas fa-external-link-alt"></i></a>`
                        : ""
                    }
                    <a href="${
                      repo.repoUrl
                    }" target="_blank" title="GitHub仓库"><i class="fab fa-github"></i></a>
                </div>
            </div>
            <p class="repo-description">${repo.description}</p>
            <div class="repo-details">
                <div class="repo-language">
                    <span class="language-color" style="background-color: ${
                      repo.languageColor
                    }"></span>
                    ${repo.language}
                </div>
                <div class="repo-stars">
                    <i class="far fa-star"></i> ${formatNumber(repo.stars)}
                </div>
                <div class="repo-forks">
                    <i class="fas fa-code-branch"></i> ${formatNumber(
                      repo.forks
                    )}
                </div>
            </div>
            <div class="repo-topics">
                ${repo.topics
                  .map((topic) => `<span class="repo-topic">${topic}</span>`)
                  .join("")}
            </div>
        `;

    reposGrid.appendChild(repoCard);
  });

  // 为GitHub卡片添加鼠标跟随效果交互
  const cursor = document.querySelector(".cursor-follower");
  if (cursor) {
    const repoCards = document.querySelectorAll(".github-repo-card");
    repoCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        cursor.classList.add("active");
      });

      card.addEventListener("mouseleave", () => {
        cursor.classList.remove("active");
      });
    });
  }
}

/**
 * 格式化数字（添加千位分隔符）
 */
function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

/**
 * 获取访客地理位置信息
 */
async function fetchVisitorLocation() {
  try {
    const response = await fetch('https://qifu-api.baidubce.com/ip/local/geo/v1/district');
    const data = await response.json();
    
    if (data.code === 'Success' && data.data) {
      displayWelcomeMessage(data.data, data.ip);
    }
  } catch (error) {
    console.log('获取地理位置信息失败:', error);
    // 显示默认欢迎信息
    displayWelcomeMessage(null, null);
  }
}

/**
 * 显示欢迎访客信息
 */
function displayWelcomeMessage(locationData, ip) {
  // 创建欢迎信息容器
  const welcomeContainer = document.createElement('div');
  welcomeContainer.id = 'visitor-welcome';
  welcomeContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: var(--primary-color);
    padding: 15px 20px;
    border-radius: 8px;
    border: 1px solid var(--primary-color);
    font-family: var(--font-mono);
    font-size: 14px;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
    animation: slideInRight 0.5s ease-out;
    backdrop-filter: blur(10px);
  `;

  let welcomeText = '';
  
  if (locationData) {
    const { country, prov, city, district, isp } = locationData;
    welcomeText = `
      <div style="margin-bottom: 8px;">
        <i class="fas fa-map-marker-alt" style="color: var(--primary-color); margin-right: 8px;"></i>
        <strong>欢迎来自${country}的朋友！</strong>
      </div>
      <div style="font-size: 12px; color: #888; line-height: 1.4;">
        📍 ${prov} ${city} ${district}<br>
        🌐 ${isp}<br>
        🔗 IP: ${ip}
      </div>
    `;
  } else {
    welcomeText = `
      <div>
        <i class="fas fa-globe" style="color: var(--primary-color); margin-right: 8px;"></i>
        <strong>欢迎访问我的网站！</strong>
      </div>
      <div style="font-size: 12px; color: #888; margin-top: 5px;">
        感谢您的到来 🎉
      </div>
    `;
  }

  welcomeContainer.innerHTML = `
    ${welcomeText}
    <button id="close-welcome" style="
      position: absolute;
      top: 5px;
      right: 8px;
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">×</button>
  `;

  // 添加CSS动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    #visitor-welcome.slide-out {
      animation: slideOutRight 0.3s ease-in forwards;
    }
    
    @media (max-width: 768px) {
      #visitor-welcome {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
        font-size: 12px;
      }
    }
  `;
  
  if (!document.querySelector('#welcome-styles')) {
    style.id = 'welcome-styles';
    document.head.appendChild(style);
  }

  // 添加到页面
  document.body.appendChild(welcomeContainer);

  // 关闭按钮事件
  const closeButton = document.getElementById('close-welcome');
  closeButton.addEventListener('click', () => {
    welcomeContainer.classList.add('slide-out');
    setTimeout(() => {
      if (document.body.contains(welcomeContainer)) {
        document.body.removeChild(welcomeContainer);
      }
    }, 300);
  });

  // 10秒后自动关闭
  // setTimeout(() => {
  //   if (document.body.contains(welcomeContainer)) {
  //     welcomeContainer.classList.add('slide-out');
  //     setTimeout(() => {
  //       if (document.body.contains(welcomeContainer)) {
  //         document.body.removeChild(welcomeContainer);
  //       }
  //     }, 300);
  //   }
  // }, 10000);

  // // 添加到终端状态消息中
  // if (locationData) {
  //  // updateTerminalStatus(locationData);
  // }
}

/**
 * 更新终端状态消息
 */
function updateTerminalStatus(locationData) {
  const statusElement = document.getElementById('status-message');
  if (statusElement && locationData) {
    const { country, prov, city } = locationData;
    const originalText = statusElement.textContent;
    
    // 添加地理位置信息到状态消息
    setTimeout(() => {
      statusElement.innerHTML = `
        <div>${originalText}</div>
        <div style="margin-top: 5px; color: var(--primary-color); font-size: 0.9em;">
          🌍 检测到来自 ${country} ${prov} ${city} 的访问
        </div>
      `;
    }, 2000);
  }
}

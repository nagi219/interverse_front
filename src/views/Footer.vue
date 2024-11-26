<template>
    <footer class="y2k-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h1>INTERVERSE</h1>
          <p>7637 Laurel Dr. King Of Prussia, PA 19406</p>
          <p>Use this tool as test data for an automated system or find your next pen</p>
        </div>
        <div class="footer-section">
          <h3>關於我們</h3>
          <p>一個充滿活力互動的平台</p>
          <button class="y2k-button">更多資訊</button>
          <button class="y2k-button">聯繫我們</button>
        </div>
        <div class="footer-section">
          <h3>我們接受</h3>
          <ul class="payment-icons">
            <li><font-awesome-icon :icon="['fab', 'cc-stripe']" /></li>
            <li><font-awesome-icon :icon="['fab', 'cc-paypal']" /></li>
            <li class="line-pay-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60">
              <path d="M13 0h134c7.18 0 13 5.82 13 13v34c0 7.18-5.82 13-13 13H13C5.82 60 0 54.18 0 47V13C0 5.82 5.82 0 13 0z" fill="#00B900"/>
              <path d="M45.13 33.67h-5.86V19.94h5.86v13.73zm16.03-13.73l-5.86 9.97v3.76h-5.86V19.94h5.86l5.86 9.97v-9.97h5.86v13.73h-5.86v-3.76l-5.86-9.97zm26 0h-5.86v13.73h5.86V19.94zm26 13.73h-5.86V19.94h5.86v13.73z" fill="#FFF"/>
              <path d="M146.35 19.94h-16.7v3.91h5.42v9.82h5.86v-9.82h5.42v-3.91z" fill="#FFF"/>
            </svg>
          </li>
          </ul>
          <ul>
            <li>服務條款</li>
            <li>隱私政策</li>
            <li>Q & A</li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>訂閱電子報</h3>
          <div class="newsletter-signup">
            <input type="email" placeholder="請輸入Email ...">
            <button>訂閱</button>
          </div>
          
          <div class="social-icons">
            <a href="#"><font-awesome-icon :icon="['fab', 'square-facebook']" /></a>
            <a href="#"><font-awesome-icon :icon="['fab', 'square-instagram']" /></a>
            <a href="#"><font-awesome-icon :icon="['fab', 'square-threads']" /></a>
            <a href="#"><font-awesome-icon :icon="['fab', 'square-x-twitter']" /></a>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup>
  // Script section remains empty as per original design
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=VT323&family=Noto+Sans+TC&display=swap');
  
  .y2k-footer {
    background:#fafafa;
    color: #8e7474;
    font-family: 'VT323', 'Noto Sans TC', 'Microsoft YaHei', sans-serif;
    padding: 40px 0;
    position: relative;
    overflow: hidden;
    width: 100%;
    margin: 0;
    box-sizing: border-box;
  }
  
  .y2k-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23d4b6b6" fill-opacity="0.4" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E');
    opacity: 0.2;
  }
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    padding: 0 20px;
  }
  
  .footer-section {
    flex: 1;
    padding: 0 10px;
    text-align: left;
  }
  
  .footer-section h1 {
    font-size: 36px;
    margin-bottom: 15px;
    text-shadow: 2px 2px #e6d0d0;
    color: #8e7474;
  }
  
  .footer-section h3 {
    font-size: 24px;
    margin-bottom: 15px;
    text-shadow: 1px 1px #e6d0d0;
    color: #8e7474;
  }
  
  .footer-section p, .footer-section li {
    font-size: 16px;
    margin-bottom: 5px;
  }
  
  .footer-section ul {
    list-style-type: none;
    padding: 0;
    margin-bottom: 15px;
  }
  
  .y2k-button {
    background: #f0e4e4;
    border: 2px solid #d4b6b6;
    color: #8e7474;
    padding: 8px 15px;
    margin: 5px 10px 5px 0;
    font-family: 'VT323', monospace;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .y2k-button:hover {
    background: #e6d0d0;
    color: #a88f8f;
    transform: skew(-10deg);
  }
  
  .payment-icons {
    display: flex;
    gap: 15px;
  }
  
  .payment-icons li {
    font-size: 36px;
    color: #a88f8f;
  }
  
  .newsletter-signup {
    display: flex;
    margin-bottom: 15px;
  }
  
  .newsletter-signup input {
    flex-grow: 1;
    padding: 8px;
    font-family: 'Noto Sans TC', sans-serif;
    border: 2px solid #d4b6b6;
    background: #f0e4e4;
    color: #8e7474;
  }
  
  .newsletter-signup button {
    padding: 8px 15px;
    font-family: 'VT323', 'Noto Sans TC', sans-serif;
    background: #e6d0d0;
    border: 2px solid #d4b6b6;
    color: #8e7474;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .newsletter-signup button:hover {
    background: #d4b6b6;
    color: #f0e4e4;
  }
  
  .social-icons {
    display: flex;
    gap: 15px;
  }
  
  .social-icons a {
    color: #a88f8f;
    font-size: 36px;
    transition: all 0.3s ease;
  }
  
  .social-icons a:hover {
    color: #c7a9a9;
    transform: scale(1.2);
  }
  
  @keyframes soft-glitch {
    0% { text-shadow: 1px 1px #e6d0d0; }
    25% { text-shadow: -1px -1px #d4b6b6; }
    50% { text-shadow: 1px -1px #c7a9a9; }
    75% { text-shadow: -1px 1px #e6d0d0; }
    100% { text-shadow: 1px 1px #d4b6b6; }
  }
  
  .footer-section h3:hover {
    animation: soft-glitch 0.5s infinite;
  }
  
  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column;
    }
    
    .footer-section {
      margin-bottom: 30px;
    }
  }
  </style>
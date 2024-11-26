<template>
    <div class="error-page">
      <div class="error-content">
        <h1>403</h1>
        <h2>哎呀！這裡是禁地</h2>
        <p>就像水豚的專屬泳池，這個區域暫時不對外開放哦。</p>
        <div class="capybara-container">
          <div class="capybara-image"></div>
        </div>
        <button @click="goHome">返回安全區</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  function goHome() {
    router.push('/');
  }
  </script>
  
  <style scoped>
  .error-page {
    background-color: #FBE4E1;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: Arial, sans-serif;
  }
  
  .error-content {
    text-align: center;
    padding: 2rem;
    background-color: #F9E1DD;
    border-radius: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    font-size: 8rem;
    color: #97715B;
    margin-bottom: 0;
  }
  
  h2 {
    font-size: 2rem;
    color: #97715B;
    margin-top: 0;
  }
  
  p {
    font-size: 1.2rem;
    color: #6B5147;
    margin-bottom: 2rem;
  }
  
  .capybara-container {
    width: 200px;
    height: 200px;
    margin: 0 auto 2rem;
    border: 10px solid #E4BAB6;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
  }
  
  .capybara-image {
    width: 100%;
    height: 100%;
    background-image: url('/public/Capybaras.gif');
    background-size: cover;
    background-position: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* animation: swim 5s linear infinite; */
    animation: float 3s ease-in-out infinite;

  }
  
  button {
    background-color: #F3D2A8;
    color: #97715B;
    border: none;
    padding: 10px 20px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    border-radius: 5px;
  }
  
  button:hover {
    background-color: #EEC48D;
  }
  
  @keyframes swim {
    0% { transform: translate(-50%, -50%) translateX(-50px); }
    100% { transform: translate(-50%, -50%) translateX(50px); }
  }
  
  @media (max-width: 768px) {
    h1 { font-size: 6rem; }
    h2 { font-size: 1.5rem; }
    p { font-size: 1rem; }
    .capybara-container {
      width: 150px;
      height: 150px;
    }
    .capybara-image {
      width: 225px;
      height: 225px;
    }
  }
  </style>
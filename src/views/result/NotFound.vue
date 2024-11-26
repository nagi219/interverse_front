<template>
    <div class="error-page">
      <div class="error-content">
        <h1>404</h1>
        <h2>糟糕！看來我們迷路了</h2>
        <p>別擔心，就像水豚一樣，我們總能找到回家的路。</p>
        <div class="capybara-container">
          <div class="capybara-image"></div>
        </div>
        <button @click="goHome">返回首頁</button>
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
  }
  
  .capybara-image {
    width: 100%;
    height: 100%;
    background-image: url('/public/Capybaras.gif');
    background-size: cover;
    background-position: center;
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
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  @media (max-width: 768px) {
    h1 { font-size: 6rem; }
    h2 { font-size: 1.5rem; }
    p { font-size: 1rem; }
    .capybara-container {
      width: 150px;
      height: 150px;
    }
  }
  </style>
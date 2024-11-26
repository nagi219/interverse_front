import { ref } from 'vue'
import { defineStore } from 'pinia'

const user = defineStore("user", function() {

    // 先宣告欲被儲存在pinia套件內的 變數 和/或 方法
    const userId = ref('');
    const nickname = ref('');
    const isLoggedIn = ref(false);
    const token = ref('');

    function setUserId(data){
        userId.value = data;
    }

    function setNickname(data){
        nickname.value = data;
    }

    function setIsLoggedIn(data){
        isLoggedIn.value = data;
    }

    function setToken(data){
        token.value = data;
    }

    function resetStore() {
        userId.value = '';
        nickname.value = '';
        isLoggedIn.value = false;
        token.value = '';
    }

    // 宣告完後拋出，即可給不同SFC使用
    return {
        userId, setUserId,
        nickname, setNickname,
        isLoggedIn, setIsLoggedIn,
        token, setToken,
        resetStore
    }
}, {
    // 另再宣告要被piniaPluginPersistedstate套件管控在 怎麼樣的storage 和 storage裡面的的paths(只需變數名)
    persist: {
        storage: localStorage,
        paths: ["userId", "nickname", "isLoggedIn", "token"]
    }
});

export default user;

/*

pinia套件能讓不同SFC共享資料，
而piniaPluginPersistedstate套件能令資料共享這件事達到半永久化（就算重新整理、清除快取等 資料都不會消失）要手動消除資料

*/
import { ref } from 'vue'
import { defineStore } from 'pinia'

const admin = defineStore("admin", function() {

    // 先宣告欲被儲存在pinia套件內的 變數 和/或 方法
    const adminId = ref('');
    const authority = ref('');
    const nickname = ref('');
    const isLoggedIn = ref(false);
    const token = ref('');

    function setAdminId(data){
        adminId.value = data;
    }

    function setAuthority(data){
        authority.value = data;
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
        adminId.value = '';
        authority.value = '';
        nickname.value = '';
        isLoggedIn.value = false;
        token.value = '';
    }

    // 宣告完後拋出，即可給不同SFC使用
    return {
        adminId, setAdminId,
        authority, setAuthority,
        nickname, setNickname,
        isLoggedIn, setIsLoggedIn,
        token, setToken,
        resetStore
    }
}, {
    // 另再宣告要被piniaPluginPersistedstate套件管控在 怎麼樣的storage 和 storage裡面的的paths(只需變數名)
    persist: {
        storage: localStorage,
        paths: ["adminId", "authority", "nickname", "isLoggedIn", "token"]
    }
});

export default admin;
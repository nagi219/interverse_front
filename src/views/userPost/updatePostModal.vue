<template>
        <div ref="exampleRef" class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">{{ post.user ? post.user.nickname : 'Loading...' }}</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <textarea v-model="post.content" rows="4" class="form-control"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal">Close</button>
                        <button type="button" class="btn btn-primary" @click="saveChanges">Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    </template>

<script setup>
        import { ref , onMounted, watch} from 'vue';
        import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
        import axios from '@/plugins/axios';
        import useUserStore from '@/stores/userstore';
        const userStore = useUserStore();
        const userId = userStore.userId;
        //define props and emits
        const props = defineProps({
                post:{
                        type:Object,
                        default:() => ({})
                }
        })
        const emits = defineEmits(["update:onePost"])


        const post=ref({...props.post})

        //Watch for prop changand update local state
        watch(() => props.post,(newPost)=>{
                post.value={...newPost}
                }, {immediate:true})
    
    const exampleRef = ref(null);
    const exampleObj = ref(null);
    //初始化exampleObj 
    onMounted(function(){
            exampleObj.value= new bootstrap.Modal(exampleRef.value);
    });
    
    function showModal(){
                exampleObj.value.show();
    }
    function hideModal(){
            exampleObj.value.hide();
    }

    function saveChanges(){
        console.log(post.value)
        if(!post.value || !post.value.id){
                console.error("Post ID is missing or post is undefined")
        return;
        }
        axios.put(`/userPost/${post.value.id}`, null, {
        params: {
            content: post.value.content
        }
        })
        .then(()=>{
                emits('update:onePost', post.value);
                hideModal();
        })
        // .then(
        // axios.get(`/userPost/showUserAllPost/${userId}`)
        // )
        .catch(error =>{
                console.error("Error updating post:", error)
        })
    }
    //SFC元件預設對外封閉，使用define()宣告要暴露給外部使用的變數與函數
    defineExpose({
            showModal, 
            hideModal
    });
    
    
    </script>
    
    <style>
    
    </style>
    
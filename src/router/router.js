import { createRouter, createWebHistory } from "vue-router";


import Home from "@/views/Home.vue";
import Forbidden from "@/views/result/Forbidden.vue";
import NotFound from "@/views/result/NotFound.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/user/Register.vue";
import CreatePost from "@/views/userPost/CreatePost.vue";
import UserPost from "@/views/userPost/UserPost.vue";
import Friend from "@/views/user/Friend.vue";
import FriendRequest from "@/views/user/FriendRequest.vue";
import Profile from "@/views/user/Profile.vue";
import Category from "@/views/Category/category.vue";
import Product from "@/views/Product/Product.vue";
import CartProductList from "@/views/Cart/CartProductList.vue";
import ShowProductDetail from "@/views/Cart/ShowProductDetail.vue";
import UserCart from "@/views/Cart/UserCart.vue";
import Wallet from "@/components/user/Wallet.vue";
import UserPostTest from "@/views/test/UserPostTest.vue";

import AdminHome from "@/views/admin/AdminHome.vue";
import AdminRegister from "@/views/admin/AdminRegister.vue";
import AdminLogin from "@/views/admin/AdminLogin.vue";
import AdminAuth from "@/views/admin/AdminAuth.vue";
import AdminTransaction from "@/views/admin/AdminTransaction.vue";

import Payment from "@/views/user/Payment.vue";
import OrderPayment from "@/views/Order/Payment.vue";
import UserOrders from "@/views/Order/UserOrders.vue";
import forum from "@/views/forum/forum.vue";
import createArticle from "@/views/forum/createArticle.vue";

import ClubList from "@/views/club/ClubList.vue";
import ClubDetail from "@/views/club/ClubDetail.vue";
import ClubForm from "@/views/club/ClubForm.vue";
import ClubEdit from "@/views/club/ClubEdit.vue";
import ClubApprove from "@/views/club/ClubApprove.vue";
import ClubApprove2 from "@/views/club/ClubApprove2.vue";
import ClubMy from "@/views/club/ClubMy.vue";
import ClubPhotoAlbum from "@/views/club/ClubPhotoAlbum.vue";
import EventList from "@/views/Event/EventList.vue";
import EventDetail from "@/views/Event/EventDetail.vue";
import ClubEvent from "@/views/Event/ClubEvent.vue";
import AddClubEventForm from "@/views/Event/AddClubEventForm.vue";
import AddWorkshopForm from "@/views/Event/AddWorkshopForm.vue";
import PaymentStatus from "@/views/Order/PaymentStatus.vue";
import oneArticle from "@/views/forum/oneArticle.vue";
import EventApprove from "@/views/Event/EventApprove.vue";
import MyJoinedEvent from "@/views/Event/MyJoinedEvent.vue";
import EventPhoto from "@/views/Event/EventPhoto.vue";
import ClubFavorite from "@/views/club/ClubFavorite.vue";

const routes = [
    //品琇
    { path: "/", name: "home-link", component: Home },
    { path: "/403", name: "403-link", component: Forbidden },
    { path: "/404", name: "404-link", component: NotFound},
    { path: "/login", name: "login-link", component: Login },
    { path: "/user/register", name: "register-link", component: Register },
    { path: "/user/profile", name: "profile-link", component: Profile },
    { path: "/user/notification", name: "notification-link", component: Notification },
    { path: "/friend", name: "friend-link", component: Friend },
    { path: "/friend/request", name: "friend-request-link", component: FriendRequest },
    { path: "/wallet", name: "wallet-link", component: Wallet },
    { path: "/payment", name: "payment-link", component: Payment },
    { path: "/admin/home", name: "admin-home-link", component: AdminHome },
    { path: "/admin/register", name: "admin-register-link", component: AdminRegister },
    { path: "/admin/login", name: "admin-login-link", component: AdminLogin },
    { path: "/admin/auth", name: "admin-auth-link", component: AdminAuth },
    { path: "/admin/transaction", name: "admin-transaction-link", component: AdminTransaction },
    { path: "/userPostTest/:id?", name: "userpost-link", component: UserPostTest },


    //靖緯
    { path: "/club/all", name: "club-all-link", component: ClubList},
    { path: "/club/:id", name:"club-detail-link", component:ClubDetail},
    { path: "/club/new", name:"club-form-link", component:ClubForm},
    { path: "/club/:id/edit",name:"club-edit-link", component:ClubEdit},
    { path: "/clubMember/approve",name:"club-approve-link", component:ClubApprove},
    { path: "/clubMember/approve2/:id",name:"club-approve2-link", component:ClubApprove2},
    { path: "/clubMember/my-clubs",name:"club-my-link", component:ClubMy},
    { path: "/club/album",name:"club-album-link", component:ClubPhotoAlbum},
    { path: "/club/favorite",name:"club-favorite-link", component:ClubFavorite},


    { path: "/event/all",name:"event-all-link", component:EventList},
    { path: "/event/detail/:id",name:"event-detail-link", component:EventDetail},
    { path: "/event/club/all",name:"event-cluball-link", component:ClubEvent},
    { path: "/event/club/new",name:"event-addclubevent-link", component:AddClubEventForm},
    { path: "/event/workshop/new",name:"event-addWorkshop-link", component:AddWorkshopForm},
    { path: "/event/approve",name:"event-approve-link", component:EventApprove},
    { path: "/event/my",name:"event-my-link", component:MyJoinedEvent},
    { path: "/event/photo",name:"event-photo-link", component:EventPhoto},



    //暐欣
    { path: "/product/category", name: "product-category", component: Category},
    { path: "/product/product", name: "product-product", component: Product },
    { path: "/product/Cart", name: "product-cart", component: CartProductList },
    { path: "/product/ProductCartDetail/:id", name: "product-cartDetail", component: ShowProductDetail },
    { path: "/cart", name: "cart-user", component: UserCart },
    { path: "/order/payment", name: "order-payment", component: OrderPayment },
    { path: "/order/userOrders", name: "user-orders", component: UserOrders },
    { path: "/order/controllStaus", name: "orderStaus-controller", component: PaymentStatus },

    //勁甫
    { path: "/club/forum", name: "club-forum", component: forum },
    { path: "/club/addArticle", name: "club-addArticle", component: createArticle },

    { path: "/post/createPost", name: "post-create-link", component: CreatePost},
    { path: "/post/userPost/:id?", name: "user-post-link", component: UserPost},
    { path: "/club/article/:id", name: "club-article-link", component: oneArticle}


]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})



export default router;
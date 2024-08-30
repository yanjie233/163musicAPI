import { createRouter, createWebHistory } from 'vue-router'
import PlaylistDownloader from '../views/PlaylistDownloader.vue'

const routes = [
  // ... 其他路由
  {
    path: '/playlist-downloader',
    name: 'PlaylistDownloader',
    component: PlaylistDownloader
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

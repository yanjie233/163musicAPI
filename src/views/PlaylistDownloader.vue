<template>
  <div class="playlist-downloader">
    <h1>歌单歌曲 URL 提取器和下载器</h1>
    <el-input v-model="playlistId" placeholder="请输入歌单ID" style="width: 300px; margin-right: 10px;"></el-input>
    <el-button @click="fetchAndProcessPlaylist" :loading="loading">获取歌曲 URL</el-button>
    <el-button @click="batchDownload" :disabled="!songUrls.length" style="margin-left: 10px;">批量下载歌曲</el-button>
    <el-input
      type="textarea"
      :rows="10"
      placeholder="处理结果将显示在这里"
      v-model="output"
      style="margin-top: 20px;"
    ></el-input>
    <div id="downloadLinks" style="margin-top: 20px;"></div>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'PlaylistDownloader',
  setup() {
    const playlistId = ref('');
    const output = ref('');
    const loading = ref(false);
    const songUrls = ref([]);

    const fetchAndProcessPlaylist = async () => {
      if (!playlistId.value) {
        output.value = '请输入歌单ID';
        return;
      }

      loading.value = true;
      output.value = '正在获取歌单信息...';
      songUrls.value = [];

      try {
        const playlistUrl = `https://163.520985.top/playlist/detail?id=${playlistId.value}`;
        const { data } = await axios.get(playlistUrl);

        if (data.code === 200 && data.playlist && data.playlist.tracks) {
          const tracks = data.playlist.tracks;
          output.value = '正在处理歌曲信息...\n\n';

          for (const track of tracks) {
            const songId = track.id;
            const songUrl = `https://163.520985.top/song/url?id=${songId}`;
            
            try {
              const { data: songData } = await axios.get(songUrl);
              
              if (songData.code === 200 && songData.data && songData.data[0]) {
                const url = songData.data[0].url;
                const type = songData.data[0].type || 'mp3';
                output.value += `歌曲ID: ${songId}, URL: ${url}, 类型: ${type}\n`;
                if (url) {
                  songUrls.value.push({id: songId, url: url, name: track.name, type: type});
                }
              } else {
                output.value += `歌曲ID: ${songId}, 无法获取 URL\n`;
              }
            } catch (error) {
              output.value += `歌曲ID: ${songId}, 获取 URL 时出错: ${error.message}\n`;
            }
          }
        } else {
          output.value = '无法获取歌单信息或歌单为空';
        }
      } catch (error) {
        output.value = `获取歌单信息时出错: ${error.message}`;
      } finally {
        loading.value = false;
      }
    };

    const batchDownload = () => {
      const downloadLinks = document.getElementById('downloadLinks');
      downloadLinks.innerHTML = '';

      songUrls.value.forEach(song => {
        const link = document.createElement('a');
        link.href = song.url;
        link.download = `${song.name}.${song.type}`;
        link.textContent = `下载 ${song.name} (${song.type})`;
        link.className = 'el-button el-button--primary el-button--small';
        link.style.marginRight = '10px';
        link.style.marginBottom = '10px';
        downloadLinks.appendChild(link);
      });

      alert('下载链接已生成。请点击每个链接来下载歌曲。');
    };

    return {
      playlistId,
      output,
      loading,
      songUrls,
      fetchAndProcessPlaylist,
      batchDownload
    };
  }
};
</script>

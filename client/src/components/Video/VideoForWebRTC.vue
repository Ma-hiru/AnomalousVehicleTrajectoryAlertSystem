<template>
  <div class="relative video-container">
    <video ref="videoRef" class="relative" :style="styles.videoStyle" autoplay muted controls />
    <div class="meta">
      <div>ID: {{ props.meta.id }}</div>
      <div>Name: {{ props.meta.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Video">
  import { onMounted, useTemplateRef } from "vue";

  /* 参数 */
  const props = defineProps<{
    width: string;
    url: string;
    meta: {
      id: string | number;
      name: string;
    };
  }>();
  const styles = {
    videoStyle: {
      width: props.width,
      height: "auto",
      margin: "10px"
    }
  };

  const videoRef = useTemplateRef("videoRef");
  const connect = async () => {
    if (!videoRef.value) return;
    const pc = new RTCPeerConnection();
    pc.ontrack = (event) => {
      videoRef.value!.srcObject = event.streams[0];
    };
    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });
    const url = new URL("api/ws?src=ffmpeg", "http://127.0.0.1:3001");
    const ws = new WebSocket("ws" + url.toString().substring(4));
    ws.addEventListener(
      "open",
      () => {
        pc.addEventListener("icecandidate", (ev) => {
          if (!ev.candidate) return;
          const msg = { type: "webrtc/candidate", value: ev.candidate.candidate };
          ws.send(JSON.stringify(msg));
        });
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            console.log("Local Offer SDP:\n", pc.localDescription!.sdp);
            const msg = { type: "webrtc/offer", value: pc.localDescription?.sdp };
            ws.send(JSON.stringify(msg));
          });
      },
      { passive: true }
    );
    ws.addEventListener(
      "message",
      (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === "webrtc/candidate") {
          pc.addIceCandidate({ candidate: msg.value, sdpMLineIndex: 0, sdpMid: "0" });
        } else if (msg.type === "webrtc/answer") {
          console.log("Remote Answer SDP:\n", msg.value);
          pc.setRemoteDescription({ type: "answer", sdp: msg.value });
        }
      },
      { passive: true }
    );
  };

  onMounted(() => {
    connect();
  });
</script>

<style scoped lang="scss">
  .video-container {
    .meta {
      display: none;
    }

    &:hover {
      .meta {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: start;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
        color: red;
      }
    }
  }
</style>

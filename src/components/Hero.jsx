"use client";
import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Hero.css";

export default function Hero() {
  // Default fallback is the high-quality horizontal MP4 served completely free via jsDelivr global CDN from GitHub (Zero Firebase Bandwidth quota!)
  const [heroVideoUrl, setHeroVideoUrl] = useState("https://cdn.jsdelivr.net/gh/GolDRoger21/cigerci@main/public/Bu%20lezzeti%20herkesin%20tatmas%C4%B1n%C4%B1%20isteriz.mp4");
  const [videoActive, setVideoActive] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeId, setYoutubeId] = useState("");
  const videoRef = useRef(null);

  // Fetch dynamic video setting from Firestore config
  useEffect(() => {
    const fetchVideoSetting = async () => {
      try {
        const docRef = doc(db, "settings", "site_config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.heroVideoUrl) {
            setHeroVideoUrl(data.heroVideoUrl);
          } else if (data.heroVideoId) {
            // Support legacy field as a fallback
            setHeroVideoUrl(data.heroVideoId);
          }
        }
      } catch (err) {
        console.error("Video ayarı yüklenirken hata oluştu:", err);
      }
    };
    fetchVideoSetting();
  }, []);

  // Determine player type and extract IDs based on the video URL
  useEffect(() => {
    setVideoActive(false);
    
    // Check if URL is YouTube Video ID or YouTube link
    const isYt = 
      !heroVideoUrl.includes(".mp4") && 
      !heroVideoUrl.includes(".webm") && 
      !heroVideoUrl.includes(".mov") && 
      (heroVideoUrl.length === 11 || 
       heroVideoUrl.includes("youtube.com") || 
       heroVideoUrl.includes("youtu.be") || 
       heroVideoUrl.includes("/embed/"));
       
    setIsYouTube(isYt);

    if (isYt) {
      // Extract 11-char YouTube ID
      let id = heroVideoUrl;
      if (heroVideoUrl.includes("watch?v=")) {
        id = heroVideoUrl.split("watch?v=")[1]?.substring(0, 11);
      } else if (heroVideoUrl.includes("youtu.be/")) {
        id = heroVideoUrl.split("youtu.be/")[1]?.substring(0, 11);
      } else if (heroVideoUrl.includes("/shorts/")) {
        id = heroVideoUrl.split("/shorts/")[1]?.substring(0, 11);
      } else if (heroVideoUrl.includes("/embed/")) {
        id = heroVideoUrl.split("/embed/")[1]?.substring(0, 11);
      }
      setYoutubeId(id || "Hzq_6lFJZUI");

      // YouTube takes slightly longer to trigger autoplay, 1.8s delay hides it perfectly.
      // NOTE: Mobile browsers commonly block iframe autoplay, so the native MP4 path is the
      // reliable one for phones. We still keep the poster visible behind the iframe as a graceful
      // fallback if YouTube never starts.
      const timer = setTimeout(() => {
        setVideoActive(true);
      }, 1800);
      return () => clearTimeout(timer);
    } else {
      // Native HTML5 video: the fade-in is driven by the real playback events (onPlaying /
      // onLoadedData) further down — not a blind timer — so on mobile we never fade the poster
      // out into a blank screen if autoplay is blocked (iOS Low Power Mode, data saver, etc.).
      // This generous timer is only a safety net for the rare case the events never fire.
      const fallbackTimer = setTimeout(() => {
        const v = videoRef.current;
        if (v && v.readyState >= 2) setVideoActive(true);
      }, 3000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [heroVideoUrl]);

  // Best-effort programmatic autoplay for the native video. Some mobile browsers ignore the
  // autoPlay attribute but allow a muted .play() call; if it is still rejected we keep the poster.
  useEffect(() => {
    if (isYouTube) return;
    const v = videoRef.current;
    if (!v) return;

    // iOS/Android only autoplay when the muted *property* (not just the JSX attribute) is true.
    // React doesn't reliably reflect the `muted` attribute onto the DOM property, which is the
    // classic reason a fully-attributed <video> still refuses to autoplay on phones — so force it.
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.playsInline = true;
    v.setAttribute("playsinline", "");

    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {/* autoplay blocked (e.g. iOS Low Power Mode) — poster stays, no blank screen */});
      }
    };

    tryPlay();
    // Retry once frames/data are available — covers slow mobile networks where the first
    // play() call happens before the browser is ready.
    v.addEventListener("loadeddata", tryPlay);
    v.addEventListener("canplay", tryPlay);

    // Last-resort fallback: if the OS blocked autoplay (e.g. iOS Low Power Mode / data saver),
    // start the video on the very first user interaction with the page (a tap or scroll always
    // happens almost immediately on mobile).
    const playOnInteract = () => {
      tryPlay();
      if (!v.paused) removeInteractListeners();
    };
    const removeInteractListeners = () => {
      document.removeEventListener("touchstart", playOnInteract);
      document.removeEventListener("click", playOnInteract);
      document.removeEventListener("scroll", playOnInteract);
    };
    document.addEventListener("touchstart", playOnInteract, { passive: true });
    document.addEventListener("click", playOnInteract);
    document.addEventListener("scroll", playOnInteract, { passive: true });

    return () => {
      v.removeEventListener("loadeddata", tryPlay);
      v.removeEventListener("canplay", tryPlay);
      removeInteractListeners();
    };
  }, [heroVideoUrl, isYouTube]);

  // Reveal the native video only once it is actually rendering frames.
  const handleVideoReady = () => {
    if (!isYouTube) setVideoActive(true);
  };

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section id="hero" className="hero-section">
      {/* Autoplay & Loop Background Video with Smooth Fade-in */}
      <div className="video-background-container">
        {/* Sharp Static Poster shown during load */}
        <div className={`hero-poster-image ${videoActive ? "fade-out" : ""}`}></div>
        
        {isYouTube ? (
          <iframe
            className={`video-bg-iframe ${videoActive ? "fade-in" : ""}`}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            title="Ciğerci Neşet Canlı Ocakbaşı Videosu"
          ></iframe>
        ) : (
          <video
            ref={videoRef}
            className={`video-bg-native ${videoActive ? "fade-in" : ""}`}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/resimler/hero_ocakbasi.png"
            onLoadedData={handleVideoReady}
            onPlaying={handleVideoReady}
            onError={() => setVideoActive(false)} // keep poster on failure, never a blank background
            key={heroVideoUrl} // Re-renders the tag cleanly if URL changes
          >
            <source src={heroVideoUrl} type="video/mp4" />
            Tarayıcınız video etiketini desteklemiyor.
          </video>
        )}
        <div className="hero-overlay"></div>
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <span className="hero-subtitle glow-text">MİSTİK BİR OCAKBAŞI DENEYİMİ</span>
        <h1 className="hero-title">
          Tarihin Lezzetle <br />
          Buluştuğu Yer: <span className="gold-text">Ciğerci Neşet</span>
        </h1>
        <p className="hero-description">
          Diyarbakır'ın bin yıllık ocakbaşı kültürünü, en taze kuzu ciğeri ve asırlık köz ateşinin 
          benzersiz uyumuyla sofranıza taşıyoruz. Neşet Usta'nın tescilli el lezzetiyle harmanlanmış 
          gerçek ocakbaşı ziyafetini keşfedin.
        </p>

        <div className="hero-cta-group">
          <a 
            href="#reservation" 
            className="btn btn-primary btn-hero" 
            onClick={(e) => handleScrollTo(e, "reservation")}
          >
            Rezervasyon Yap 📅
          </a>
          <a 
            href="#menu" 
            className="btn btn-secondary btn-hero" 
            onClick={(e) => handleScrollTo(e, "menu")}
          >
            Menümüzü İncele 🍽️
          </a>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <a 
        href="#history" 
        className="scroll-down-indicator" 
        onClick={(e) => handleScrollTo(e, "history")}
        aria-label="Aşağı Kaydır"
      >
        <span className="scroll-arrow">↓</span>
      </a>
    </section>
  );
}

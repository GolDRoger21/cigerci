"use client";
import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Reviews.css";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    userName: "",
    rating: 5,
    comment: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, "reviews"),
        where("isApproved", "==", true),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setReviews(items);
      setLoading(false);
    } catch (err) {
      console.error("Yorum çekme hatası:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRatingSelect = (ratingValue) => {
    setFormData({
      ...formData,
      rating: ratingValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.userName || !formData.comment) {
      setError("Lütfen adınızı ve yorumunuzu giriniz.");
      setSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        userName: formData.userName,
        rating: parseInt(formData.rating),
        comment: formData.comment,
        date: new Date().toISOString(),
        isApproved: true // Auto-approved for instant demo responsiveness
      });

      setSuccess(true);
      setSubmitting(false);
      setFormData({
        userName: "",
        rating: 5,
        comment: ""
      });
      
      // Refresh list
      fetchReviews();
      
      // Clear success alert after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Yorum yazma hatası:", err);
      setError("Yorumunuz kaydedilirken bir hata oluştu.");
      setSubmitting(false);
    }
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < count ? "star gold-star" : "star grey-star"}>
        ★
      </span>
    ));
  };

  return (
    <section id="reviews" className="reviews-section">
      <div className="section-container">
        
        {/* Title */}
        <div className="section-title-wrapper">
          <span className="section-subtitle">MÜŞTERİ YORUMLARI</span>
          <h2 className="section-title">Misafirlerimizin Kaleminden</h2>
        </div>

        <div className="reviews-grid-layout">
          
          {/* Reviews List */}
          <div className="reviews-list-column">
            {loading ? (
              <div className="reviews-loading">
                <div className="menu-spinner"></div>
                <p>Yorumlar getiriliyor...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="reviews-empty glass-card text-center">
                <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
              </div>
            ) : (
              <div className="reviews-cards-stack">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item-card glass-card">
                    <div className="review-card-top">
                      <div className="review-user-info">
                        <span className="review-user-avatar">❖</span>
                        <div>
                          <h4 className="review-username">{review.userName}</h4>
                          <span className="review-date">
                            {new Date(review.date).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="review-stars-wrapper">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="review-form-column">
            <div className="review-form-wrapper glass-card">
              <h3 className="review-form-title gold-text">Değerlendirme Bırakın</h3>
              <p className="review-form-desc">
                Deneyiminizi ve lezzet hakkındaki fikirlerinizi bizimle paylaşın.
              </p>

              {success && (
                <div className="review-success-banner animate-success">
                  <span>✔</span> Yorumunuz başarıyla yayınlandı!
                </div>
              )}

              {error && (
                <div className="review-error-banner">
                  <span>⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="review-add-form">
                <div className="form-group">
                  <label>Puanınız</label>
                  <div className="star-rating-selector">
                    {Array.from({ length: 5 }, (_, i) => {
                      const ratingVal = i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`star-select-btn ${
                            ratingVal <= (hoverRating || formData.rating) ? "active" : ""
                          }`}
                          onClick={() => handleRatingSelect(ratingVal)}
                          onMouseEnter={() => setHoverRating(ratingVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`${ratingVal} Yıldız`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="userName">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Mustafa Yılmaz"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="comment">Yorumunuz *</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    placeholder="Ciğer lokum gibiydi, mezeler çok tazeydi..."
                    rows="4"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-review-submit" disabled={submitting}>
                  {submitting ? "Gönderiliyor..." : "Yorumu Gönder 🔥"}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

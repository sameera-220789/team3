export default function AdminCategories() {
  return (
    <div className="admin-grid">
      <div className="card">
        <div className="card-header-section">
          <h3 className="card-title">Category Management</h3>
          <button className="btn btn-small btn-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3V13M3 8H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add Category
          </button>
        </div>
        <div className="category-manage-list">
          <div className="manage-category-item">
            <div className="manage-category-info">
              <span className="manage-emoji">🍔</span>
              <div>
                <p className="manage-category-name">Food & Dining</p>
                <p className="manage-category-usage">24,580 users</p>
              </div>
            </div>
            <div className="manage-actions">
              <button className="icon-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11 2L14 5L5 14H2V11L11 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              <button className="icon-btn danger">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12L11 13C11 13.5523 10.5523 14 10 14H6C5.44772 14 5 13.5523 5 13L4 4Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="manage-category-item">
            <div className="manage-category-info">
              <span className="manage-emoji">✈️</span>
              <div>
                <p className="manage-category-name">Travel & Transport</p>
                <p className="manage-category-usage">18,240 users</p>
              </div>
            </div>
            <div className="manage-actions">
              <button className="icon-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11 2L14 5L5 14H2V11L11 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              <button className="icon-btn danger">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12L11 13C11 13.5523 10.5523 14 10 14H6C5.44772 14 5 13.5523 5 13L4 4Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="manage-category-item">
            <div className="manage-category-info">
              <span className="manage-emoji">🛍️</span>
              <div>
                <p className="manage-category-name">Shopping</p>
                <p className="manage-category-usage">31,560 users</p>
              </div>
            </div>
            <div className="manage-actions">
              <button className="icon-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11 2L14 5L5 14H2V11L11 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              <button className="icon-btn danger">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12L11 13C11 13.5523 10.5523 14 10 14H6C5.44772 14 5 13.5523 5 13L4 4Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="manage-category-item">
            <div className="manage-category-info">
              <span className="manage-emoji">📄</span>
              <div>
                <p className="manage-category-name">Bills & Utilities</p>
                <p className="manage-category-usage">42,890 users</p>
              </div>
            </div>
            <div className="manage-actions">
              <button className="icon-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11 2L14 5L5 14H2V11L11 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              <button className="icon-btn danger">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12L11 13C11 13.5523 10.5523 14 10 14H6C5.44772 14 5 13.5523 5 13L4 4Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="manage-category-item">
            <div className="manage-category-info">
              <span className="manage-emoji">🎬</span>
              <div>
                <p className="manage-category-name">Entertainment</p>
                <p className="manage-category-usage">28,450 users</p>
              </div>
            </div>
            <div className="manage-actions">
              <button className="icon-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11 2L14 5L5 14H2V11L11 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              <button className="icon-btn danger">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12L11 13C11 13.5523 10.5523 14 10 14H6C5.44772 14 5 13.5523 5 13L4 4Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


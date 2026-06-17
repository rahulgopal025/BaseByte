import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { notifications, unreadCount, markAsRead } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-[#0A0A0C]"></span>
        )}
      </button>

      {isOpen && (
        <div className="fixed right-4 md:right-24 top-20 w-80 max-h-[28rem] flex flex-col bg-[#0A0A0C]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in slide-in-from-right-5 duration-300 overflow-hidden">
          
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="font-black text-white text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="overflow-y-auto flex-1 no-scrollbar p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="mx-auto h-8 w-8 text-white/10 mb-3" />
                <p className="text-sm font-medium text-white/40">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${notif.isRead ? 'hover:bg-white/5' : 'bg-indigo-500/5 hover:bg-indigo-500/10'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {!notif.isRead && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></div>}
                        <h4 className={`text-sm font-bold truncate ${notif.isRead ? 'text-white/70' : 'text-white'}`}>
                          {notif.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-white/30 whitespace-nowrap ml-2">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className={`text-xs mt-1 line-clamp-2 ${notif.isRead ? 'text-white/40' : 'text-white/60'}`}>
                      {notif.message}
                    </p>

                    {notif.link && (
                      <div className="mt-2 text-xs font-bold text-indigo-400 flex items-center gap-1 group">
                        View Details <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

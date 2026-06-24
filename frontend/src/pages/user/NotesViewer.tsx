import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Lock, FileText, ZoomIn, ZoomOut, Search, Maximize } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";
import axiosInstance from "../../api/axios.instance";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function NotesViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [note, setNote] = useState<any>(null);
  const [hasPurchasedCourse, setHasPurchasedCourse] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [numPages, setNumPages] = useState<number>();
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  // Base width for scale=1 (fit to screen)
  const [baseWidth, setBaseWidth] = useState<number>(
    window.innerWidth < 640 ? window.innerWidth - 16 : Math.min(window.innerWidth - 80, 1000)
  );

  const [sliderValue, setSliderValue] = useState<number>(1);
  const [jumpPage, setJumpPage] = useState<string>('');
  
  // Native scale state
  const [scale, setScale] = useState<number>(1);
  const scaleRef = useRef(1);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    const handleResize = () => {
      setBaseWidth(window.innerWidth < 640 ? window.innerWidth - 16 : Math.min(window.innerWidth - 80, 1000));
    };
    handleResize(); // Set initially
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const container = document.getElementById('pdf-container');
    if (!container) return;

    // Handle scroll for page numbers
    const handleScroll = () => {
      const startPage = hasPurchasedCourse ? 1 : Math.min(numPages || 1, note?.previewStartPage || 1);
      const endPage = hasPurchasedCourse ? (numPages || 1) : Math.min(numPages || 1, note?.previewEndPage || 5);
      const scrollY = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      if (scrollHeight <= 0) {
        setSliderValue(startPage);
        return;
      }
      
      const ratio = scrollY / scrollHeight;
      const currentPage = startPage + Math.round(ratio * (endPage - startPage));
      setSliderValue(Math.max(startPage, Math.min(endPage, currentPage)));
    };

    // Handle pinch-to-zoom (Trackpad)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault(); // Prevent native browser zoom
        setScale(prev => {
          const newScale = prev - e.deltaY * 0.01;
          return Math.max(0.5, Math.min(newScale, 4));
        });
      }
    };

    // Handle pinch-to-zoom (Mobile Touch)
    let initialDist = 0;
    let startScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault(); // Prevent native browser zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDist = Math.sqrt(dx * dx + dy * dy);
        startScale = scaleRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault(); // Prevent native browser zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Add a small threshold to avoid jitters
        if (initialDist > 0) {
          const ratio = dist / initialDist;
          const newScale = startScale * ratio;
          setScale(Math.max(0.5, Math.min(newScale, 4)));
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [numPages, hasPurchasedCourse, note]);
  
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToastContext();

  useEffect(() => {
    axiosInstance.get(`/api/notes/${id}`)
      .then(res => {
        setNote(res.data.data.note);
        setHasPurchasedCourse(res.data.data.hasPurchasedCourse);
      })
      .catch(err => setPdfError("Failed to load notes. " + (err.response?.data?.message || "")))
      .finally(() => setLoading(false));
  }, [id]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPage);
    if (!target || isNaN(target)) return;
    
    const startPage = hasPurchasedCourse ? 1 : Math.min(numPages || 1, note?.previewStartPage || 1);
    const endPage = hasPurchasedCourse ? (numPages || 1) : Math.min(numPages || 1, note?.previewEndPage || 5);
    
    if (target < startPage || target > endPage) {
      showToast(`Please enter a page between ${startPage} and ${endPage}`, 'error');
      return;
    }

    const element = document.getElementById(`page_${target}`);
    const container = document.getElementById('pdf-container');
    if (element && container) {
      container.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      setSliderValue(target);
    }
    setJumpPage('');
  };

  const handlePurchaseNote = async () => {
    if (!user) { navigate("/auth"); return; }
    setProcessing(true);
    try {
      const orderRes = await axiosInstance.post("/api/payment/create", { noteId: id });
      const { orderId, amount, currency, key } = orderRes.data.data;

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key,
          amount,
          currency,
          name: "BaseByte Notes",
          description: note.title,
          order_id: orderId,
          prefill: { name: user?.name, email: user?.email },
          theme: { color: "#6366F1" },
          handler: async (response: any) => {
            try {
              await axiosInstance.post("/api/payment/verify", {
                orderId,
                noteId: id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });
              showToast("Payment successful! Note unlocked.", "success");
              setHasPurchasedCourse(true);
            } catch {
              showToast("Payment verification failed.", "error");
            }
          }
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
        setProcessing(false);
      };

      script.onerror = () => {
        showToast("Failed to load payment gateway.", "error");
        setProcessing(false);
      };
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Payment failed.", "error");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 size={48} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (pdfError || !note) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-3xl font-black mb-4 text-rose-500">Error</h1>
        <p className="text-zinc-400">{pdfError || "Note not found"}</p>
        <button onClick={() => navigate('/notes')} className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all">Go Back</button>
      </div>
    );
  }

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 4));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  return (
    <div className="bg-[#050505] flex flex-col text-white h-[100dvh] overflow-hidden select-none" onContextMenu={e => e.preventDefault()}>
      {/* Sleek Glassmorphic Header */}
      <div className="bg-[#0a0a0b]/80 backdrop-blur-2xl border-b border-white/10 flex flex-col z-50 shadow-2xl shrink-0">
        <div className="p-3 md:p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
              <ArrowLeft size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 rounded-lg border border-white/5 hidden sm:block">
                <FileText size={16} className="text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-black text-sm md:text-base line-clamp-1 max-w-[200px] md:max-w-md">{note.title}</h1>
                {!hasPurchasedCourse && (
                  <span className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-widest sm:hidden">Preview Mode</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!hasPurchasedCourse && (
              <span className="hidden sm:inline-block px-3 py-1 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-[10px] font-black uppercase tracking-widest rounded-full whitespace-nowrap">
                Preview Mode
              </span>
            )}

            {/* Jump to Page Input in Header */}
            <form onSubmit={handleJumpToPage} className="flex items-center gap-1 bg-white/5 rounded-full border border-white/10 px-2 py-1.5 md:px-4 md:py-2 hover:bg-white/10 transition-colors">
              <input 
                type="number"
                min={hasPurchasedCourse ? 1 : (note?.previewStartPage || 1)}
                max={numPages ? (hasPurchasedCourse ? numPages : Math.min(numPages, note?.previewEndPage || 5)) : 1}
                value={jumpPage}
                onChange={e => setJumpPage(e.target.value)}
                placeholder={sliderValue.toString()}
                className="w-8 md:w-10 bg-transparent text-white text-xs font-bold text-center focus:outline-none placeholder:text-white focus:bg-black/50 rounded py-0.5"
                title="Type a page number and press Enter"
              />
              <span className="text-xs font-bold text-zinc-400 whitespace-nowrap pr-2">
                / {numPages ? (hasPurchasedCourse ? numPages : Math.min(numPages, note?.previewEndPage || 5)) : '...'}
              </span>
            </form>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Viewer Area */}
        <div id="pdf-container" className="flex-1 overflow-auto bg-[#000000] relative scroll-smooth w-full">
          <div className="p-2 sm:p-6 pt-6 pb-32 flex flex-col items-center mx-auto" style={{ minWidth: 'max-content' }}>
            <Document
              file={note.notesPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<Loader2 size={32} className="text-indigo-500 animate-spin mt-24 mx-auto" />}
              className="flex flex-col gap-4 sm:gap-8 items-center w-full"
              error={<div className="text-rose-500 mt-24 font-bold bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 text-center">Failed to load PDF file.</div>}
            >
              {(() => {
                let pagesToRender: number[] = [];
                if (numPages) {
                  if (hasPurchasedCourse) {
                    pagesToRender = Array.from({ length: numPages }, (_, i) => i + 1);
                  } else {
                    const start = Math.min(note?.previewStartPage || 1, numPages);
                    const end = Math.min(note?.previewEndPage || 5, numPages);
                    pagesToRender = Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
                  }
                }
                return pagesToRender.map((pageNum) => (
                  <div id={`page_${pageNum}`} key={`page_${pageNum}`} className="bg-white p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-[0_10px_40px_rgba(255,255,255,0.05)] relative group transition-all duration-300">
                    {/* Page Number Indicator (Subtle) */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      {pageNum}
                    </div>
                    <Page 
                      pageNumber={pageNum} 
                      renderTextLayer={false} 
                      renderAnnotationLayer={false}
                      className="rounded-lg overflow-hidden shadow-sm pointer-events-none"
                      width={baseWidth}
                      scale={scale}
                    />
                  </div>
                ));
              })()}

              {/* Premium Lock Screen */}
              {!hasPurchasedCourse && numPages && numPages > (note?.previewEndPage || 5) && (
                <div className="w-full max-w-2xl bg-[#0a0a0b]/90 backdrop-blur-2xl border border-indigo-500/30 rounded-[32px] p-8 md:p-14 text-center mt-8 relative overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.15)] mx-4 sm:mx-0 sticky left-4 right-4" style={{ width: Math.min(baseWidth, 600) }}>
                  {/* Glowing Background Orbs */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/30 rounded-full blur-[80px] pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                      <Lock size={36} className="text-indigo-400" />
                    </div>
                    
                    <h2 className="text-2xl md:text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Unlock Full Access</h2>
                    <p className="text-zinc-400 text-sm md:text-base mb-10 max-w-md mx-auto leading-relaxed">
                      You've reached the end of the free preview. Purchase this note to unlock all <span className="text-white font-bold">{numPages} pages</span> instantly.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button 
                        onClick={handlePurchaseNote}
                        disabled={processing}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-600/30 w-full sm:w-auto disabled:opacity-60 disabled:hover:scale-100"
                      >
                        {processing ? "Processing..." : `Purchase for ₹${note.offerPrice > 0 ? note.offerPrice : note.price}`}
                      </button>
                      {note.courses?.map((c: any) => (
                        <button 
                          key={c._id}
                          onClick={() => navigate(`/courses/${c._id}`)}
                          className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:scale-[1.02] active:scale-95 w-full sm:w-auto backdrop-blur-md"
                        >
                          View Linked Course
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Document>
          </div>
        </div>

        {/* Adobe-style Floating Vertical Toolbar (Right side) */}
        <div className="absolute bottom-8 sm:bottom-12 right-4 sm:right-8 bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden pointer-events-auto">
          <div className="py-3 px-1 text-[10px] font-bold text-zinc-400 border-b border-white/10 w-full text-center bg-black/20">
            {Math.round(scale * 100)}%
          </div>
          <button onClick={handleZoomIn} className="p-3 hover:bg-white/10 text-white transition-colors" title="Zoom In">
            <ZoomIn size={20} />
          </button>
          <button onClick={handleResetZoom} className="p-3 hover:bg-white/10 text-white border-y border-white/5 transition-colors bg-white/5" title="Fit to Screen">
            <Maximize size={20} />
          </button>
          <button onClick={handleZoomOut} className="p-3 hover:bg-white/10 text-white transition-colors" title="Zoom Out">
            <ZoomOut size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}

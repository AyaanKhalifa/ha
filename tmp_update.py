import sys

with open('d:/ha/src/pages/Book.jsx', 'r', encoding='utf-8') as f:
    orig = f.read()

parts = orig.split('export default function Book() {')

new_code = """export default function Book() {
  const { searchParams, setSearchParams } = useBooking();
  const { convertPrice } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // Results per tab (0: outbound/flight1, 1: return/flight2, etc)
  const [searchResults, setSearchResults] = useState({});
  const [dateRibbon, setDateRibbon] = useState({});

  const tripType = searchParams?.tripType || 'one-way';
  const isMulti = tripType === 'multi-city';
  const isReturn = tripType === 'return';

  // Build uniform segments array
  const segments = isMulti ? searchParams?.multiCitySegments || [] : [
    { from: searchParams?.from, to: searchParams?.to, dep: searchParams?.departureDate },
    ...(isReturn && searchParams?.returnDate ? [{ from: searchParams?.to, to: searchParams?.from, dep: searchParams?.returnDate }] : [])
  ];

  const [activeTab, setActiveTab] = useState(0);

  // Filters State
  const [filterStops, setFilterStops] = useState([]);
  const [filterTime, setFilterTime] = useState([]);
  const [filterMaxPrice, setFilterMaxPrice] = useState(null);
  
  const loadRibbonFor = async (segment, pax, cabin) => {
    setDateRibbon({}); // reset
    if (!segment || !segment.dep) return;
    const baseDate = new Date(segment.dep + 'T12:00:00');
    const dates = [-2, -1, 0, 1, 2].map(d => {
        const out = new Date(baseDate);
        out.setDate(out.getDate() + d);
        return out.toISOString().split('T')[0];
    });
    
    const priceMap = {};
    await Promise.all(dates.map(async d => {
        try {
            const res = await flightService.search({
                from: segment.from, to: segment.to, date: d, cabin, passengers: pax
            });
            if (res.length > 0) priceMap[d] = Math.min(...res.map(f => f.prices?.[cabin] || f.price));
            else priceMap[d] = null;
        } catch(e) {}
    }));
    setDateRibbon(priceMap);
  };

  const doSearchSegment = useCallback(async (tabIndex, segs) => {
    const seg = segs[tabIndex];
    if (!seg || !seg.from || !seg.to) return;
    setLoading(true);
    setSearched(false);
    
    try {
      const pax = (searchParams?.passengers?.adults || 1) + (searchParams?.passengers?.children || 0);
      const cabin = searchParams?.cabinClass || 'Economy';
      const out = await flightService.search({
        from: seg.from, to: seg.to, date: seg.dep, cabin, passengers: pax
      });
      
      setSearchResults(prev => ({ ...prev, [tabIndex]: out }));
      loadRibbonFor(seg, pax, cabin);
      setSearched(true);
    } catch (e) {
      // toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    doSearchSegment(activeTab, segments);
  }, [activeTab, searchParams?.departureDate, searchParams?.returnDate, searchParams?.multiCitySegments, doSearchSegment]);

  const handleSelect = (flight, cabin, fare, total) => {
    if (isMulti) {
        const prevFlights = searchParams.multiCityFlights || [];
        const newFlights = [...prevFlights];
        newFlights[activeTab] = {
            selectedFlight: flight,
            selectedFare: fare,
            from: segments[activeTab].from,
            to: segments[activeTab].to
        };
        
        let newTotal = total;
        if (activeTab > 0) newTotal += (searchParams.totalAmount || 0);
        
        setSearchParams(prev => ({ ...prev, multiCityFlights: newFlights, totalAmount: newTotal }));
        
        if (activeTab < segments.length - 1) {
            setActiveTab(activeTab + 1);
            window.scrollTo(0, 0);
        } else {
            navigate('/summary');
        }
    } else {
        if (isReturn && activeTab === 0) {
            setSearchParams(prev => ({ ...prev, selectedFlight: flight, fare, outboundTotal: total }));
            setActiveTab(1);
            window.scrollTo(0, 0);
        } else if (isReturn && activeTab === 1) {
            setSearchParams(prev => ({ ...prev, returnFlight: flight, returnFare: fare, returnTotal: total, totalAmount: (prev.outboundTotal || 0) + total }));
            navigate('/summary');
        } else {
            setSearchParams(prev => ({ ...prev, selectedFlight: flight, fare, totalAmount: total }));
            navigate('/summary');
        }
    }
  };

  const changeDate = (newDate) => {
      if (isMulti) {
          const newSegs = [...segments];
          newSegs[activeTab].dep = newDate;
          setSearchParams(p => ({ ...p, multiCitySegments: newSegs }));
      } else {
          if (activeTab === 0) setSearchParams(p => ({ ...p, departureDate: newDate }));
          if (activeTab === 1) setSearchParams(p => ({ ...p, returnDate: newDate }));
      }
  };

  const toggleFilter = (setState, value) => {
    setState(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const currentFlights = searchResults[activeTab] || [];
  
  const currentSeg = segments[activeTab] || {};
  const datesRibbonArray = [-2, -1, 0, 1, 2].map(d => {
      const out = new Date((currentSeg.dep || searchParams?.departureDate || "2026-04-11") + "T12:00:00");
      out.setDate(out.getDate() + d);
      return out.toISOString().split("T")[0];
  });

  const filteredFlights = currentFlights.filter(f => {
      if (filterStops.length > 0 && !filterStops.includes(String(f.stops))) return false;
      if (filterTime.length > 0) {
          const hour = parseInt(f.depStr.split(':')[0], 10);
          const timeOfDay = hour < 12 ? 'Morning' : (hour < 18 ? 'Afternoon' : 'Evening');
          if (!filterTime.includes(timeOfDay)) return false;
      }
      if (filterMaxPrice && (f.prices?.[searchParams?.cabinClass||"Economy"] || f.price) > filterMaxPrice) return false;
      return true;
  });

  const maxAvailPrice = currentFlights.length > 0 ? Math.max(...currentFlights.map(f => f.prices?.[searchParams?.cabinClass||"Economy"] || f.price)) : 0;

  return (
    <div style={{ background:"#F8F7F4", minHeight:"100vh", fontFamily:"DM Sans,sans-serif" }}>
      <WizardSteps current={0} />
      
      <div style={{ background:"#1A1A1A", padding:"24px", color:"#fff" }}>
          <div className="container" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                  <h1 style={{ fontSize:22, fontWeight:700 }}>Select Flights</h1>
                  <p style={{ fontSize:14, opacity:0.7 }}>
                    {segments.map((s, idx) => (
                      <span key={idx}>
                         {s.from} → {s.to} ({s.dep}) {idx < segments.length - 1 ? ' • ' : ''}
                      </span>
                    ))}
                  </p>
              </div>
              <button onClick={() => navigate('/')} style={{ background:"rgba(255,255,255,.1)", border:"none", color:"#fff", padding:"8px 16px", borderRadius:4, cursor:"pointer" }}>Modify search</button>
          </div>
      </div>

      <div className="container" style={{ padding:"40px 24px", display:"grid", gridTemplateColumns:"280px 1fr", gap:32, alignItems:"start" }}>
          
          {/* Left Sidebar Filters */}
          <div style={{ background:"#fff", border:"1px solid #E0E0E0", borderRadius:8, padding:"24px" }}>
              <div style={{ fontSize:18, fontWeight:800, marginBottom:24, color:"#1A1A1A" }}>Filter by</div>
              
              <div style={{ marginBottom:32 }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Stops</div>
                  <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, cursor:"pointer" }}>
                      <input type="checkbox" checked={filterStops.includes('0')} onChange={() => toggleFilter(setFilterStops, '0')} style={{ width:18, height:18, accentColor:"#C8102E" }}/>
                      <span style={{ fontSize:14, color:"#444" }}>Non-stop</span>
                  </label>
                  <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                      <input type="checkbox" checked={filterStops.includes('1')} onChange={() => toggleFilter(setFilterStops, '1')} style={{ width:18, height:18, accentColor:"#C8102E" }}/>
                      <span style={{ fontSize:14, color:"#444" }}>1 Stop</span>
                  </label>
              </div>

              <div style={{ marginBottom:32 }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Departure time</div>
                  {['Morning', 'Afternoon', 'Evening'].map(time => (
                      <label key={time} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, cursor:"pointer" }}>
                          <input type="checkbox" checked={filterTime.includes(time)} onChange={() => toggleFilter(setFilterTime, time)} style={{ width:18, height:18, accentColor:"#C8102E" }}/>
                          <span style={{ fontSize:14, color:"#444" }}>{time}</span>
                      </label>
                  ))}
              </div>

              {maxAvailPrice > 0 && (
                <div style={{ marginBottom:32 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                      <div style={{ fontSize:14, fontWeight:700 }}>Max Price</div>
                      <div style={{ fontSize:13, color:"#C8102E", fontWeight:700 }}>{convertPrice(filterMaxPrice || maxAvailPrice)}</div>
                  </div>
                  <input type="range" min="0" max={maxAvailPrice} value={filterMaxPrice || maxAvailPrice} onChange={(e) => setFilterMaxPrice(Number(e.target.value))} style={{ width:"100%", accentColor:"#C8102E" }} />
                </div>
              )}
          </div>

          {/* Results */}
          <div>
              {segments.length > 1 && (
                  <div style={{ display:"flex", background:"#fff", borderRadius:8, overflow:"hidden", marginBottom:24, border:"1px solid #EEE" }}>
                      {segments.map((seg, idx) => {
                          let label = isMulti ? "Flight " + (idx+1) : (idx === 0 ? "Outbound" : "Return");
                          const allowed = isMulti ? idx <= (searchParams.multiCityFlights?.length || 0) : (idx === 0 || !!searchParams.selectedFlight);
                          return (
                              <button key={idx} onClick={() => allowed && setActiveTab(idx)} style={{ flex:1, padding:"16px", border:"none", background: activeTab === idx ? "#FFF5F5" : "#fff", color: !allowed ? "#CCC" : activeTab === idx ? "#C8102E" : "#666", fontWeight:700, borderBottom: activeTab === idx ? "4px solid #C8102E" : "none", cursor: !allowed ? "not-allowed" : "pointer" }}>
                                  {label} {!allowed && "(Select Previous)"}
                              </button>
                          );
                      })}
                  </div>
              )}

              {/* Flexible Dates Ribbon */}
              {currentSeg.dep && (
                <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom:24, paddingBottom:8 }}>
                   {datesRibbonArray.map(d => {
                       const isSel = d === currentSeg.dep;
                       const dObj = new Date(d + "T12:00:00");
                       const p = dateRibbon[d];
                       return (
                           <div key={d} onClick={() => changeDate(d)} style={{ minWidth:110, padding:"12px", background: isSel ? "#C8102E" : "#fff", color: isSel ? "#fff" : "#1A1A1A", border: isSel ? "1px solid #C8102E" : "1px solid #E0E0E0", borderRadius:8, textAlign:"center", cursor:"pointer", transition:"all 0.2s", boxShadow: isSel ? "0 4px 12px rgba(200,16,46,0.2)" : "none" }}>
                               <div style={{ fontSize:11, textTransform:"uppercase", fontWeight:700 }}>{dObj.toLocaleDateString('en-US',{weekday:'short'})}</div>
                               <div style={{ fontSize:16, fontWeight:900, margin:"4px 0" }}>{dObj.getDate()} {dObj.toLocaleDateString('en-US',{month:'short'})}</div>
                               <div style={{ fontSize:12, color: isSel ? "rgba(255,255,255,.8)" : "#888", minHeight:16 }}>
                                  {p ? convertPrice(p) : p === null ? "-" : "..."}
                               </div>
                           </div>
                       );
                   })}
                </div>
              )}

              {loading ? (
                  <div style={{ textAlign:"center", padding:"80px" }}>
                      <div className="spinner" style={{ border:"4px solid #F3F3F3", borderTop:"4px solid #C8102E", borderRadius:"50%", width:40, height:40, animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
                      <p>Searching for best fares on {currentSeg.dep}...</p>
                  </div>
              ) : (
                  <div>
                      <div style={{ margin:"0 auto" }}>
                          <div style={{ marginBottom:16, fontSize:14, color:"#666" }}>Showing {filteredFlights.length} flights for {currentSeg.from} to {currentSeg.to}</div>
                          {filteredFlights.map(f => (
                              <FlightCard 
                                key={f.id} 
                                flight={f} 
                                cabin={searchParams?.cabinClass || 'Economy'} 
                                pax={(searchParams?.passengers?.adults || 1)}
                                onSelect={handleSelect}
                                convertPrice={convertPrice}
                              />
                          ))}
                          {searched && filteredFlights.length === 0 && (
                              <div style={{ background:"#fff", padding:"60px", textAlign:"center", borderRadius:8, border:"1px solid #EEE" }}>
                                  <p style={{ fontSize:18, color:"#888" }}>No flights found matching your filters on {currentSeg.dep}.</p>
                                  <button onClick={() => { setFilterStops([]); setFilterTime([]); setFilterMaxPrice(null); }} style={{ marginTop:16, padding:"10px 20px", background:"#1A1A1A", color:"#fff", border:"none", borderRadius:4, cursor:"pointer" }}>Clear filters</button>
                                  <button onClick={() => navigate('/')} style={{ marginTop:16, marginLeft:12, padding:"10px 20px", background:"#fff", color:"#C8102E", border:"1px solid #C8102E", borderRadius:4, cursor:"pointer" }}>Change Route</button>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
"""

with open('d:/ha/src/pages/Book.jsx', 'w', encoding='utf-8') as f:
    f.write(parts[0] + new_code)

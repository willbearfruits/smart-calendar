import React from 'react';
import { CalendarEvent, Task } from '../types';

interface PrintLayoutProps {
  events: CalendarEvent[];
  tasks: Task[];
  monthName: string;
  side: 'A' | 'B';
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ events, tasks, monthName, side }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to render event list without truncation dots
  const renderEventList = (dayEvents: CalendarEvent[]) => (
    <div className="flex flex-col gap-0.5 w-full mt-1">
      {dayEvents.map((ev, idx) => (
        <div key={idx} className="text-[7px] leading-[8px] w-full bg-gray-50 rounded px-0.5 border border-gray-100 break-words whitespace-normal overflow-hidden max-h-[24px]">
          <span className="font-bold mr-1">{ev.time ? ev.time.split(' ')[0] : '•'}</span>
          {ev.title}
        </div>
      ))}
    </div>
  );

  // --- Page Content Components ---

  const Page1_Cover = () => (
    <div className="w-full h-full p-6 flex flex-col items-center justify-center bg-white">
      <div className="border-4 border-black p-4 w-full h-full flex flex-col items-center justify-center rounded-xl">
        <h1 className="text-5xl font-black tracking-tighter uppercase text-center leading-none">{monthName}</h1>
        <div className="w-full h-px bg-black my-4"></div>
        <p className="text-center font-hand text-xl">The Plan.</p>
        <p className="text-center font-mono text-[8px] mt-auto">Volume 1</p>
      </div>
    </div>
  );

  const Page2_MonthView = () => (
    <div className="w-full h-full p-4 bg-white">
      <h3 className="font-bold text-sm uppercase border-b-2 border-black mb-2">Month at a Glance</h3>
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
        {days.map(d => (
          <div key={d} className="bg-gray-50 text-[6px] font-bold text-center p-0.5">{d.slice(0,1)}</div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => {
           const dayNum = (i % 30) + 1;
           const dayOfWeek = i % 7;
           const hasEvents = events.some(e => e.dayOfWeek === dayOfWeek);
           return (
            <div key={i} className="bg-white h-8 p-0.5 relative">
              <span className="text-[6px] text-gray-400 absolute top-0.5 left-0.5">{dayNum}</span>
              {hasEvents && <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-black rounded-full"></div>}
            </div>
           )
        })}
      </div>
    </div>
  );

  const Page3_Goals = () => (
    <div className="w-full h-full p-5 bg-white flex flex-col">
      <h3 className="font-black text-xl uppercase mb-4">Top 3 Priorities</h3>
      <div className="flex-1 flex flex-col gap-4">
        {[1, 2, 3].map(i => (
           <div key={i} className="flex-1 border-2 border-black rounded-lg p-2 relative">
             <div className="absolute -top-3 -left-2 bg-black text-white w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs">{i}</div>
           </div>
        ))}
      </div>
    </div>
  );

  const Page4_Week1_2 = () => (
    <div className="w-full h-full p-4 bg-white">
       <h3 className="font-bold text-xs uppercase bg-black text-white px-1 inline-block mb-2">Weeks 1-2</h3>
       <div className="grid grid-cols-2 gap-2 h-[85%]">
          {days.map((d, i) => (
             <div key={d} className="border-l-2 border-gray-200 pl-1">
                <div className="text-[8px] font-bold uppercase">{d}</div>
                {renderEventList(events.filter(e => e.dayOfWeek === i))}
             </div>
          ))}
       </div>
    </div>
  );

  const Page5_Week3_4 = () => (
    <div className="w-full h-full p-4 bg-white">
       <h3 className="font-bold text-xs uppercase bg-black text-white px-1 inline-block mb-2">Weeks 3-4</h3>
       <div className="grid grid-cols-2 gap-2 h-[85%]">
          {days.map((d, i) => (
             <div key={d} className="border-l-2 border-gray-200 pl-1">
                <div className="text-[8px] font-bold uppercase">{d}</div>
                {renderEventList(events.filter(e => e.dayOfWeek === i))}
             </div>
          ))}
       </div>
    </div>
  );

  const Page6_Habits = () => (
    <div className="w-full h-full p-5 bg-white">
      <h3 className="font-bold text-sm uppercase mb-2 border-b-2 border-black">Daily Tracker</h3>
      <div className="grid grid-cols-8 gap-0 text-[8px] border-t border-l border-gray-300">
         <div className="col-span-1 p-1 font-bold border-b border-r border-gray-300">Habit</div>
         {['M','T','W','T','F','S','S'].map(d => <div key={d} className="col-span-1 p-1 text-center border-b border-r border-gray-300 bg-gray-50">{d}</div>)}
         
         {[1,2,3,4,5,6,7,8].map(row => (
            <React.Fragment key={row}>
                <div className="col-span-1 h-5 border-b border-r border-gray-300"></div>
                {Array.from({length:7}).map((_, c) => <div key={c} className="col-span-1 h-5 border-b border-r border-gray-300"></div>)}
            </React.Fragment>
         ))}
      </div>
    </div>
  );

  const Page7_Tasks = () => (
    <div className="w-full h-full p-4 bg-white flex flex-col">
       <h3 className="font-bold text-lg uppercase tracking-wider border-b-2 border-black inline-block mb-3">Checklist</h3>
       <div className="flex-1 space-y-2 overflow-hidden">
          {tasks.slice(0, 12).map((task, i) => (
              <div key={i} className="flex items-start gap-2">
                  <div className="w-3 h-3 border border-black rounded-sm flex-shrink-0 mt-0.5"></div>
                  <span className="font-hand text-[9px] leading-tight break-words">{task.title}</span>
              </div>
          ))}
          {Array.from({ length: Math.max(0, 12 - tasks.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-2 opacity-30">
                  <div className="w-3 h-3 border border-black rounded-sm flex-shrink-0"></div>
                  <div className="h-3 border-b border-gray-400 w-full"></div>
              </div>
          ))}
       </div>
    </div>
  );

  const Page8_Notes = () => (
    <div className="w-full h-full p-6 bg-white flex flex-col">
       <h2 className="text-xl font-hand mb-2 font-bold text-center">Notes</h2>
       <div className="flex-1 w-full border-2 border-gray-200 rounded-lg p-2 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
       </div>
       <div className="mt-2 text-[6px] text-center text-gray-400">Generated by Note-to-Calendar</div>
    </div>
  );

  // --- Imposition Logic ---
  // SIDE A: Front of Sheet
  // Top Left (Inv): P8 (Back Cover)
  // Top Right (Inv): P1 (Front Cover)
  // Bottom Left: P2 (Inside Front)
  // Bottom Right: P7 (Inside Back)

  // SIDE B: Back of Sheet (Flip Long Edge)
  // Top Left (Inv): P6 (Inside Spread Left) -> Backs P1
  // Top Right (Inv): P3 (Inside Spread Right) -> Backs P8
  // Bottom Left: P4 (Center Left) -> Backs P7
  // Bottom Right: P5 (Center Right) -> Backs P2

  return (
    <div className="w-[297mm] h-[210mm] bg-white text-black mx-auto overflow-hidden relative shadow-2xl print:shadow-none print:w-full print:h-full">
      {/* Cut/Fold Guides */}
      <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-gray-300 print:border-gray-400 z-10"></div>
      <div className="absolute top-0 left-1/2 h-full border-l border-dashed border-gray-300 print:border-gray-400 z-10"></div>
      
      {/* Orientation Indicator (Non-Printing usually, but helpful here) */}
      <div className="absolute top-0 left-0 bg-yellow-300 px-2 py-1 text-[10px] font-bold z-50 print:hidden">
        PREVIEW: SIDE {side} - {side === 'A' ? 'Print First' : 'Flip Paper on Long Edge & Print Second'}
      </div>

      {side === 'A' ? (
        <>
          {/* Quadrant 1: Top Left (Upside Down) -> Page 8 */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 rotate-180 border-r border-b border-gray-100 overflow-hidden">
             <Page8_Notes />
          </div>

          {/* Quadrant 2: Top Right (Upside Down) -> Page 1 */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 rotate-180 border-b border-gray-100 overflow-hidden">
             <Page1_Cover />
          </div>

          {/* Quadrant 3: Bottom Left -> Page 2 */}
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 border-r border-gray-100 overflow-hidden">
             <Page2_MonthView />
          </div>

          {/* Quadrant 4: Bottom Right -> Page 7 */}
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 overflow-hidden">
             <Page7_Tasks />
          </div>
        </>
      ) : (
        <>
           {/* Quadrant 1: Top Left (Upside Down) -> Page 6 */}
           <div className="absolute top-0 left-0 w-1/2 h-1/2 rotate-180 border-r border-b border-gray-100 overflow-hidden">
              <Page6_Habits />
           </div>

           {/* Quadrant 2: Top Right (Upside Down) -> Page 3 */}
           <div className="absolute top-0 right-0 w-1/2 h-1/2 rotate-180 border-b border-gray-100 overflow-hidden">
              <Page3_Goals />
           </div>

           {/* Quadrant 3: Bottom Left -> Page 4 */}
           <div className="absolute bottom-0 left-0 w-1/2 h-1/2 border-r border-gray-100 overflow-hidden">
              <Page4_Week1_2 />
           </div>

           {/* Quadrant 4: Bottom Right -> Page 5 */}
           <div className="absolute bottom-0 right-0 w-1/2 h-1/2 overflow-hidden">
              <Page5_Week3_4 />
           </div>
        </>
      )}
    </div>
  );
};

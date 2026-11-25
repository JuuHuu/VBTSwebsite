import type { HardwareLever } from '../../data/hardwareGoals';

interface MorphingSchematicProps {
  lever: HardwareLever;
}

const MOD_FILL = '#E8A87C';
const MOD_STROKE = '#9A4D24';
const BASE_GEL = '#A9D6F2';
const BASE_HOUSING = '#D9E2EC';
const BASE_DARK = '#334E68';

export function MorphingSchematic({ lever }: MorphingSchematicProps) {
  const id = lever.id;

  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
      <div className="mb-2 flex w-full items-center justify-between text-xs">
        <span className="font-semibold text-slate-800">{lever.fig3Label}</span>
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-xs border border-[#9A4D24] bg-[#E8A87C]" />
            Modified / Added
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-xs border border-[#486581] bg-[#A9D6F2]" />
            Unchanged Baseline
          </span>
        </div>
      </div>

      <svg viewBox="0 0 360 190" className="h-48 w-full max-w-md">
        {/* Default baseline housing frame (overridden for wide/compact/roller cases) */}
        {id === 'folded_optics' && (
          <g>
            {/* Slim wide finger housing */}
            <path d="M40,42 H320 V152 H40 Z M62,62 V132 H298 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            {/* Elastomer on top left */}
            <path d="M62,42 Q125,58 188,42 L188,62 H62 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            {/* Left LED */}
            <rect x={64} y={76} width={10} height={34} fill={BASE_DARK} />
            {/* Modified angled mirror */}
            <polygon points="88,128 168,128 88,92" fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.8} />
            {/* Folded optical path dashed ray */}
            <polyline points="125,54 125,110 260,110" fill="none" stroke={MOD_STROKE} strokeWidth={1.5} strokeDasharray="5 4" />
            {/* Side-mounted lens & CMOS */}
            <ellipse cx={268} cy={110} rx={8} ry={18} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.5} />
            <rect x={286} y={84} width={12} height={52} fill={BASE_DARK} />
            <text x={125} y={144} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Folded Mirror</text>
          </g>
        )}

        {id === 'specialized_optics' && (
          <g>
            <path d="M55,44 H305 V148 H55 Z M77,64 V128 H283 V64 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M77,44 Q180,62 283,44 L283,64 H77 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={79} y={76} width={9} height={32} fill={BASE_DARK} />
            <rect x={272} y={76} width={9} height={32} fill={BASE_DARK} />
            {/* Microlens array / coded mask */}
            {[112, 146, 180, 214, 248].map((cx) => (
              <ellipse key={cx} cx={cx} cy={92} rx={12} ry={5} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            ))}
            <rect x={128} y={118} width={104} height={10} fill={BASE_DARK} />
            <text x={180} y={168} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Microlens Array / Coded Mask</text>
          </g>
        )}

        {id === 'remote_imaging' && (
          <g>
            {/* Tiny distal tip */}
            <path d="M40,42 H172 V120 H40 Z M58,58 V104 H154 V58 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M58,42 Q106,56 154,42 L154,58 H58 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={60} y={66} width={8} height={26} fill={BASE_DARK} />
            <rect x={144} y={66} width={8} height={26} fill={BASE_DARK} />
            {/* Fiber bundle cable */}
            <path d="M106,104 C106,156 175,156 218,128" fill="none" stroke={MOD_STROKE} strokeWidth={5.5} strokeLinecap="round" />
            <path d="M106,104 C106,156 175,156 218,128" fill="none" stroke={MOD_FILL} strokeWidth={2.5} strokeLinecap="round" />
            {/* Remote camera box */}
            <rect x={220} y={96} width={96} height={60} rx={5} fill="#FFF7ED" stroke={MOD_STROKE} strokeWidth={1.8} />
            <ellipse cx={252} cy={126} rx={10} ry={18} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.5} />
            <rect x={286} y={106} width={14} height={40} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.5} />
            <text x={268} y={172} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Fiber Bundle + Remote Camera</text>
          </g>
        )}

        {id === 'compact_assemblies' && (
          <g>
            <path d="M108,36 H252 V156 H108 Z M126,56 V136 H234 V56 Z" fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.8} fillRule="evenodd" />
            <path d="M126,36 Q180,54 234,36 L234,56 H126 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={128} y={68} width={9} height={32} fill={MOD_STROKE} />
            <rect x={223} y={68} width={9} height={32} fill={MOD_STROKE} />
            <ellipse cx={180} cy={104} rx={14} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={156} y={126} width={48} height={10} fill={BASE_DARK} />
            <text x={180} y={175} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Co-Packaged Miniature Housing &amp; Light Guide</text>
          </g>
        )}

        {id === 'expanding_view' && (
          <g>
            <path d="M36,42 H324 V152 H36 Z M56,62 V132 H304 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M56,42 Q180,58 304,42 L304,62 H56 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={58} y={76} width={9} height={34} fill={BASE_DARK} />
            <rect x={293} y={76} width={9} height={34} fill={BASE_DARK} />
            {/* Wide-angle fisheye rays */}
            <line x1={180} y1={104} x2={64} y2={58} stroke={MOD_STROKE} strokeWidth={1.6} strokeDasharray="5 3" />
            <line x1={180} y1={104} x2={296} y2={58} stroke={MOD_STROKE} strokeWidth={1.6} strokeDasharray="5 3" />
            <circle cx={180} cy={104} r={14} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.8} />
            <rect x={154} y={122} width={52} height={10} fill={BASE_DARK} />
            <text x={180} y={172} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Wide-Angle / Fisheye / Multi-Camera FOV</text>
          </g>
        )}

        {id === 'moving_optics' && (
          <g>
            <path d="M36,42 H324 V152 H36 Z M56,62 V132 H304 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M56,42 Q180,56 304,42 L304,62 H56 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            {/* Moving camera carriage */}
            <ellipse cx={180} cy={102} rx={14} ry={9} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            <rect x={152} y={118} width={56} height={11} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            {/* Left/right scan arrows */}
            <line x1={142} y1={102} x2={100} y2={102} stroke={MOD_STROKE} strokeWidth={2} />
            <polygon points="98,102 108,97 108,107" fill={MOD_STROKE} />
            <line x1={218} y1={102} x2={260} y2={102} stroke={MOD_STROKE} strokeWidth={2} />
            <polygon points="262,102 252,97 252,107" fill={MOD_STROKE} />
            <text x={180} y={172} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Actuated Scanning / Rotating Camera</text>
          </g>
        )}

        {id === 'moving_surface' && (
          <g>
            <path d="M56,68 H304 V154 H56 Z M76,84 V136 H284 V84 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            {/* Rolling silicone belt + rollers */}
            <rect x={54} y={38} width={252} height={24} rx={12} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.8} />
            <circle cx={66} cy={50} r={8} fill="#FFF7ED" stroke={MOD_STROKE} strokeWidth={1.6} />
            <circle cx={294} cy={50} r={8} fill="#FFF7ED" stroke={MOD_STROKE} strokeWidth={1.6} />
            <path d="M275,26 H308 Q318,26 318,38" fill="none" stroke={MOD_STROKE} strokeWidth={1.8} />
            <polygon points="318,41 313,33 323,33" fill={MOD_STROKE} />
            <ellipse cx={180} cy={110} rx={14} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={156} y={126} width={48} height={10} fill={BASE_DARK} />
            <text x={180} y={174} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Continuous Rolling Silicone Belt / Roller</text>
          </g>
        )}

        {id === 'reflective_surfaces' && (
          <g>
            <path d="M98,42 H262 V154 H98 Z M118,62 V134 H242 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M118,42 Q180,58 242,42 L242,62 H118 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            {/* Highlighted thin matte reflective coating */}
            <path d="M118,42 Q180,58 242,42" fill="none" stroke={MOD_STROKE} strokeWidth={5.5} strokeLinecap="round" />
            <path d="M118,42 Q180,58 242,42" fill="none" stroke={MOD_FILL} strokeWidth={2.5} strokeLinecap="round" />
            <rect x={120} y={76} width={10} height={32} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.5} />
            <rect x={230} y={76} width={10} height={32} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.5} />
            <ellipse cx={180} cy={104} rx={14} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={156} y={124} width={48} height={10} fill={BASE_DARK} />
            <text x={180} y={174} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Thin Matte Reflective Coating + Directional LEDs</text>
          </g>
        )}

        {id === 'visible_features' && (
          <g>
            <path d="M98,42 H262 V154 H98 Z M118,62 V134 H242 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M118,42 Q180,58 242,42 L242,62 H118 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            {/* Internal pins / markers */}
            {[130, 146, 162, 180, 198, 214, 230].map((px, idx) => {
              const drop = idx === 3 ? 8 : idx === 2 || idx === 4 ? 6 : 3;
              return (
                <g key={px}>
                  <line x1={px} y1={45 + drop} x2={px} y2={62 + drop} stroke={MOD_STROKE} strokeWidth={2.2} />
                  <circle cx={px} cy={63 + drop} r={2.8} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.2} />
                </g>
              );
            })}
            <rect x={120} y={78} width={9} height={30} fill={BASE_DARK} />
            <rect x={231} y={78} width={9} height={30} fill={BASE_DARK} />
            <ellipse cx={180} cy={106} rx={14} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={156} y={124} width={48} height={10} fill={BASE_DARK} />
            <text x={180} y={174} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Internal Pins / Dense Coded / UV Markers</text>
          </g>
        )}

        {id === 'elastomer_design' && (
          <g>
            <path d="M36,42 H190 V154 H36 Z M56,62 V134 H170 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            {/* Multilayer modified elastomer */}
            <path d="M56,36 Q113,56 170,36 L170,66 H56 Z" fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.8} />
            <path d="M56,52 Q113,62 170,52" fill="none" stroke={MOD_STROKE} strokeWidth={1.4} strokeDasharray="4 2" />
            <ellipse cx={113} cy={104} rx={13} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={90} y={124} width={46} height={10} fill={BASE_DARK} />
            {/* Axis-labeled mini curve (Force vs Indentation range) */}
            <g transform="translate(215, 36)">
              <line x1={16} y1={108} x2={126} y2={108} stroke={BASE_DARK} strokeWidth={1.4} />
              <line x1={16} y1={14} x2={16} y2={108} stroke={BASE_DARK} strokeWidth={1.4} />
              <path d="M16,108 Q64,98 86,58 T120,20" fill="none" stroke={MOD_STROKE} strokeWidth={2.4} />
              <path d="M16,108 Q60,104 92,84 T120,68" fill="none" stroke="#94A3B8" strokeWidth={1.6} strokeDasharray="4 3" />
              <text x={72} y={124} textAnchor="middle" fontSize={9.5} fill={BASE_DARK}>Indentation δ</text>
              <text x={8} y={62} textAnchor="middle" fontSize={9.5} fill={BASE_DARK} transform="rotate(-90 8 62)">Force Range</text>
              <text x={86} y={22} fontSize={8.5} fill={MOD_STROKE} fontWeight={600}>Multilayer</text>
            </g>
            <text x={180} y={176} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Dual-Stiffness / Microstructured Elastomer</text>
          </g>
        )}

        {id === 'marker_arrangements' && (
          <g>
            <path d="M98,42 H262 V154 H98 Z M118,62 V134 H242 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M118,38 Q180,54 242,38 L242,64 H118 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            {/* Dual-depth marker layers */}
            {[132, 152, 172, 192, 212, 230].map((mx) => (
              <g key={mx}>
                <circle cx={mx} cy={47} r={3} fill={MOD_STROKE} />
                <circle cx={mx + 4} cy={57} r={2.8} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1} />
              </g>
            ))}
            <ellipse cx={180} cy={104} rx={14} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={156} y={124} width={48} height={10} fill={BASE_DARK} />
            <text x={180} y={174} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Multi-Depth / Optimized Marker Layouts</text>
          </g>
        )}

        {id === 'optical_arrangements' && (
          <g>
            <path d="M88,42 H272 V154 H88 Z M108,62 V134 H252 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M108,42 Q180,58 252,42 L252,62 H108 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            {/* Stereo lenses & sensors angled inward */}
            <g transform="translate(146,112) rotate(22)">
              <ellipse cx={0} cy={-10} rx={12} ry={6} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
              <rect x={-18} y={2} width={36} height={9} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            </g>
            <g transform="translate(214,112) rotate(-22)">
              <ellipse cx={0} cy={-10} rx={12} ry={6} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
              <rect x={-18} y={2} width={36} height={9} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            </g>
            <line x1={148} y1={98} x2={180} y2={54} stroke={MOD_STROKE} strokeWidth={1.2} strokeDasharray="4 3" />
            <line x1={212} y1={98} x2={180} y2={54} stroke={MOD_STROKE} strokeWidth={1.2} strokeDasharray="4 3" />
            <text x={180} y={174} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Stereo / Virtual-Mirror 3D Viewpoints</text>
          </g>
        )}

        {id === 'structural_design' && (
          <g>
            {/* Top elastomer plate on springs */}
            <path d="M98,36 Q180,50 262,36 L262,52 H98 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.5} />
            {/* Left & Right spring suspension */}
            <polyline points="110,52 102,60 118,68 102,76 118,84 110,92" fill="none" stroke={MOD_STROKE} strokeWidth={2.5} />
            <polyline points="250,52 242,60 258,68 242,76 258,84 250,92" fill="none" stroke={MOD_STROKE} strokeWidth={2.5} />
            {/* Lower housing */}
            <path d="M98,92 H122 V136 H238 V92 H262 V154 H98 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} />
            <ellipse cx={180} cy={108} rx={14} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={156} y={126} width={48} height={10} fill={BASE_DARK} />
            <text x={180} y={174} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Compliant Spring Suspension / Ring Mount</text>
          </g>
        )}

        {id === 'surface_recovery' && (
          <g>
            <path d="M36,42 H190 V154 H36 Z M56,62 V134 H170 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M56,42 Q113,52 170,42 L170,60 H56 Z" fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.8} />
            <ellipse cx={113} cy={104} rx={13} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={90} y={124} width={46} height={10} fill={BASE_DARK} />
            {/* Axis-labeled fast recovery vs viscoelastic lag */}
            <g transform="translate(215, 36)">
              <line x1={16} y1={108} x2={126} y2={108} stroke={BASE_DARK} strokeWidth={1.4} />
              <line x1={16} y1={14} x2={16} y2={108} stroke={BASE_DARK} strokeWidth={1.4} />
              <path d="M22,108 L32,26 H62 L72,108 H120" fill="none" stroke={MOD_STROKE} strokeWidth={2.4} />
              <path d="M22,108 L32,26 H62 C78,76 92,102 120,106" fill="none" stroke="#94A3B8" strokeWidth={1.6} strokeDasharray="4 3" />
              <text x={72} y={124} textAnchor="middle" fontSize={9.5} fill={BASE_DARK}>Time t</text>
              <text x={8} y={62} textAnchor="middle" fontSize={9.5} fill={BASE_DARK} transform="rotate(-90 8 62)">Rebound</text>
              <text x={74} y={44} fontSize={8.5} fill={MOD_STROKE} fontWeight={600}>Fast silicone</text>
            </g>
            <text x={180} y={176} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Low-Hysteresis Fast-Recovering Elastomer</text>
          </g>
        )}

        {id === 'high_speed_frame' && (
          <g>
            <path d="M40,42 H184 V154 H40 Z M58,62 V134 H166 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M58,42 Q112,56 166,42 L166,62 H58 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <ellipse cx={112} cy={104} rx={13} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={86} y={124} width={52} height={10} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.8} />
            {/* Rapid frame stack */}
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={215 + k * 18} y={54 + k * 5} width={58} height={74} rx={3} fill="#E0F2FE" stroke="#0369A1" strokeWidth={1.3} opacity={0.85} />
            ))}
            <text x={265} y={42} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>120–600+ fps Stream</text>
            <text x={180} y={174} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>High-Speed / Monochrome Frame Camera</text>
          </g>
        )}

        {id === 'event_imaging' && (
          <g>
            <path d="M40,42 H184 V154 H40 Z M58,62 V134 H166 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M58,42 Q112,56 166,42 L166,62 H58 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <ellipse cx={112} cy={104} rx={13} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={86} y={124} width={52} height={10} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.8} />
            {/* Asynchronous spike timeline */}
            <rect x={208} y={54} width={122} height={76} rx={6} fill="#0F172A" />
            {[224, 238, 250, 268, 282, 294, 312].map((sx, idx) => (
              <line
                key={sx}
                x1={sx}
                y1={92}
                x2={sx}
                y2={idx % 2 === 0 ? 66 : 114}
                stroke={idx % 2 === 0 ? '#38BDF8' : '#F59E0B'}
                strokeWidth={2.4}
              />
            ))}
            <line x1={216} y1={92} x2={322} y2={92} stroke="#64748B" strokeWidth={1} />
            <text x={269} y={44} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Async + / − Events (µs)</text>
            <text x={180} y={174} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Neuromorphic Event-Based Image Sensor</text>
          </g>
        )}

        {id === 'tactile_visual' && (
          <g>
            <path d="M98,64 H262 V158 H98 Z M118,82 V138 H242 V82 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            {/* Transparent see-through skin */}
            <path d="M118,64 Q180,76 242,64 L242,82 H118 Z" fill={MOD_FILL} fillOpacity={0.55} stroke={MOD_STROKE} strokeWidth={1.8} />
            {/* External objects visible through clear pad */}
            <circle cx={155} cy={30} r={12} fill="#CBD5E1" stroke={BASE_DARK} strokeWidth={1.4} />
            <polygon points="205,18 220,30 212,44 196,44 190,30" fill="#93C5FD" stroke={BASE_DARK} strokeWidth={1.4} />
            <line x1={180} y1={112} x2={155} y2={42} stroke={MOD_STROKE} strokeWidth={1.3} strokeDasharray="4 3" />
            <line x1={180} y1={112} x2={205} y2={42} stroke={MOD_STROKE} strokeWidth={1.3} strokeDasharray="4 3" />
            <ellipse cx={180} cy={112} rx={14} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={156} y={128} width={48} height={10} fill={BASE_DARK} />
            <text x={180} y={177} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Transparent / Switchable See-Through Skin</text>
          </g>
        )}

        {id === 'multispectral' && (
          <g>
            <path d="M72,42 H288 V154 H72 Z M92,62 V134 H268 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M92,42 Q180,58 268,42 L268,62 H92 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            {/* Dual spectral channels: Vis + IR/Thermal */}
            <ellipse cx={142} cy={104} rx={14} ry={8} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            <rect x={122} y={122} width={40} height={10} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            <text x={142} y={88} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={700}>Vis / UV</text>
            <ellipse cx={218} cy={104} rx={14} ry={8} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            <rect x={198} y={122} width={40} height={10} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            <text x={218} y={88} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={700}>NIR / IR</text>
            <text x={180} y={174} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Multispectral Optical Channels (Vis + NIR + Thermal)</text>
          </g>
        )}

        {id === 'additional_sensors' && (
          <g>
            <path d="M98,42 H262 V154 H98 Z M118,62 V134 H242 V62 Z" fill={BASE_HOUSING} stroke={BASE_DARK} strokeWidth={1.6} fillRule="evenodd" />
            <path d="M118,42 Q180,58 242,42 L242,62 H118 Z" fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <ellipse cx={180} cy={104} rx={14} ry={8} fill={BASE_GEL} stroke={BASE_DARK} strokeWidth={1.4} />
            <rect x={156} y={124} width={48} height={10} fill={BASE_DARK} />
            {/* Embedded IMU + Contact Mic */}
            <rect x={122} y={118} width={22} height={14} rx={2} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            <rect x={216} y={118} width={22} height={14} rx={2} fill={MOD_FILL} stroke={MOD_STROKE} strokeWidth={1.6} />
            <text x={68} y={128} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={700}>IMU / Piezo</text>
            <line x1={96} y1={125} x2={120} y2={125} stroke={MOD_STROKE} strokeWidth={1.4} />
            <text x={294} y={128} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={700}>Contact Mic</text>
            <line x1={240} y1={125} x2={264} y2={125} stroke={MOD_STROKE} strokeWidth={1.4} />
            <text x={180} y={174} textAnchor="middle" fontSize={10} fill={MOD_STROKE} fontWeight={600}>Hybrid Acoustic / Inertial / Piezoresistive Transducers</text>
          </g>
        )}
      </svg>
    </div>
  );
}

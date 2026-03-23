'use client';

interface GymBuildingProps {
  regionId: number;
  regionName: string;
}

export default function GymBuilding({ regionId, regionName }: GymBuildingProps) {
  return (
    <div className="gym-building-wrapper bounce-in">
      <div className={`gym-themed gym-region-${regionId}`}>
        {regionId === 1 && <CottageGym />}
        {regionId === 2 && <TreehouseGym />}
        {regionId === 3 && <CaveGym />}
        {regionId === 4 && <DomeGym />}
        {regionId === 5 && <LighthouseGym />}
        {regionId === 6 && <PagodaGym />}
        {regionId === 7 && <ArenaGym />}
      </div>
      <div className="gym-sign">{regionName} Gym</div>
    </div>
  );
}

function CottageGym() {
  return (
    <>
      <div className="cottage-chimney">
        <div className="cottage-smoke" />
        <div className="cottage-smoke s2" />
      </div>
      <div className="cottage-roof" />
      <div className="cottage-body">
        <div className="cottage-window left" />
        <div className="cottage-door" />
        <div className="cottage-window right" />
      </div>
      <div className="cottage-flowers">
        <span className="cf" />
        <span className="cf c2" />
        <span className="cf c3" />
      </div>
    </>
  );
}

function TreehouseGym() {
  return (
    <>
      <div className="tree-canopy" />
      <div className="tree-platform">
        <div className="tree-walls">
          <div className="tree-door" />
        </div>
      </div>
      <div className="tree-trunk" />
      <div className="tree-ladder">
        {[0, 1, 2, 3, 4].map(i => <div key={i} className="tree-rung" />)}
      </div>
      <div className="tree-lantern left" />
      <div className="tree-lantern right" />
    </>
  );
}

function CaveGym() {
  return (
    <>
      <div className="cave-arch" />
      <div className="cave-opening">
        <div className="cave-crystal left" />
        <div className="cave-crystal right" />
        <div className="cave-crystal center" />
      </div>
      <div className="cave-stalactite s1" />
      <div className="cave-stalactite s2" />
      <div className="cave-stalactite s3" />
      <div className="cave-torch left" />
      <div className="cave-torch right" />
    </>
  );
}

function DomeGym() {
  return (
    <>
      <div className="dome-glass" />
      <div className="dome-base" />
      <div className="dome-bubble b1" />
      <div className="dome-bubble b2" />
      <div className="dome-bubble b3" />
      <div className="dome-coral left" />
      <div className="dome-coral right" />
    </>
  );
}

function LighthouseGym() {
  return (
    <>
      <div className="lighthouse-top">
        <div className="lighthouse-beam" />
      </div>
      <div className="lighthouse-tower" />
      <div className="lighthouse-base" />
      <div className="lighthouse-wave w1" />
      <div className="lighthouse-wave w2" />
    </>
  );
}

function PagodaGym() {
  return (
    <>
      <div className="pagoda-roof r1" />
      <div className="pagoda-roof r2" />
      <div className="pagoda-roof r3" />
      <div className="pagoda-body">
        <div className="pagoda-window" />
      </div>
      <div className="pagoda-orb o1" />
      <div className="pagoda-orb o2" />
      <div className="pagoda-mist" />
    </>
  );
}

function ArenaGym() {
  return (
    <>
      <div className="arena-roof" />
      <div className="arena-body">
        <div className="arena-glass" />
        <div className="arena-doors" />
      </div>
      <div className="arena-sign-text">GYM</div>
      <div className="arena-spotlight left" />
      <div className="arena-spotlight right" />
      <div className="arena-star s1">★</div>
      <div className="arena-star s2">★</div>
    </>
  );
}

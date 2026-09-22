import courtPoster from "@/assets/fae-court-3d-render.webp.asset.json";

export default function CourtExperience() {
  return (
    <figure className="court-still">
      <img src={courtPoster.url} alt="Realistic 3D perspective render of the full FilAmElite basketball court" loading="lazy" />
    </figure>
  );
}
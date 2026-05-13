/**
 * Default hub copy for top-level categories — imported only by `src/scripts/seed.ts`.
 * After seeding, edit via MongoDB or future admin fields; the app reads from the database.
 */
export type CategoryHubEditorialSeed = {
  title: string;
  dek: string;
  advice: string;
  searches: string[];
};

export const categoryHubEditorialSeed: Record<string, CategoryHubEditorialSeed> = {
  bedroom: {
    title: "Bedroom ideas that make the end of the day feel slower",
    dek: "A bedroom should do more than look serene in a saved photo. It should soften noise, hold your routines, and make sleep feel like something you have designed for instead of something you collapse into.",
    advice:
      "Start with textiles, lighting, and scale. Better bedding, low lamps, a rug that reaches beyond the bed, and curtains with generous fullness will change the entire room before you touch the furniture.",
    searches: ["cozy bedroom ideas", "neutral bedding layers", "small bedroom styling", "boutique hotel bedroom"],
  },
  bathroom: {
    title: "Bathroom styling for daily rituals that feel spa-level",
    dek: "The best bathrooms are not overdecorated. They are edited, tactile, and deeply practical: towels stacked with intention, counters that stay calm, storage that does not apologise for real life.",
    advice:
      "Think in zones: sink ritual, towel storage, bathing softness, and one decorative pause. Stone, glass, cotton, and warm wood can make even a modest bathroom feel quietly luxurious.",
    searches: ["spa bathroom ideas", "bathroom counter styling", "small bathroom storage", "luxury towel styling"],
  },
  "kitchen-and-table": {
    title: "Kitchen and table ideas for rooms that gather beautifully",
    dek: "A beautiful kitchen is not just cabinetry. It is the morning coffee corner, the runner that softens dinner, the ceramics you reach for daily, and the lighting that makes everyone linger.",
    advice:
      "Keep counters visually calm by grouping utility into styled zones. Let boards, crocks, glassware, trays, and linens become the decor so the room remains useful and editorial at once.",
    searches: ["Pinterest kitchen decor", "kitchen counter styling", "tablescape ideas", "coffee station decor"],
  },
  decoration: {
    title: "Decoration ideas with memory, texture, and restraint",
    dek: "Decor is where a home reveals its personality. The secret is not adding more objects; it is choosing pieces that create rhythm, shadow, height, and a sense that the room has been gathered over time.",
    advice:
      "Mix one sculptural object, one practical vessel, one textile moment, and one piece with patina. Then leave enough air around them so each detail can actually be seen.",
    searches: ["organic modern decor", "quiet luxury accessories", "shelf styling ideas", "warm lighting corners"],
  },
  "wall-decor": {
    title: "Wall decor ideas that make rooms feel architecturally finished",
    dek: "Walls are not background; they control the room’s vertical rhythm. Art, molding, mirrors, shelves, and texture can make a space feel taller, warmer, calmer, or more collected.",
    advice:
      "Anchor every wall choice to the furniture beneath it. Hang art lower than instinct suggests, repeat frame finishes, and use negative space as part of the composition.",
    searches: ["gallery wall layout", "modern wall molding", "canvas art ideas", "entryway wall decor"],
  },
  "kids-ideas": {
    title: "Kids room ideas that grow with real families",
    dek: "Children’s spaces should feel imaginative without becoming visually exhausting. The most successful rooms balance washable materials, flexible storage, and a few joyful details that can change as personality grows.",
    advice:
      "Keep long-term furniture simple and let color arrive through bedding, rugs, wall art, lamps, and baskets. Hooks, low shelves, and labeled containers make independence part of the design.",
    searches: ["kids bedroom decor", "playroom storage ideas", "washable kids bedding", "nursery wall styling"],
  },
};

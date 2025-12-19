// Utility functions

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function getCircleNumber(step) {
  return step === '1' || step === 1 ? '①' : step === '2' || step === 2 ? '②' : '③';
}

export function calculateMaxParticipantDistance(participants) {
  let maxDistance = 0;
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const d = calculateDistance(
        participants[i].lat, participants[i].lng,
        participants[j].lat, participants[j].lng
      );
      maxDistance = Math.max(maxDistance, d);
    }
  }
  return maxDistance;
}

export function getTranslatedModeLabel(mode, lang) {
  const labels = {
    driving: lang === 'fr' ? 'Voiture' : 'Car',
    cycling: lang === 'fr' ? 'Vélo' : 'Bike',
    walking: lang === 'fr' ? 'À pied' : 'Walking'
  };
  return labels[mode] || labels.driving;
}

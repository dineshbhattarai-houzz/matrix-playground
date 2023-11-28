export function renderMoodboards(
  roomId: string,
  eventId: string,
  projectId: string
) {
  return `
	Here are the moodboards available. Select one of them
	<ul>
	  <li>
    <a target="_blank" href="http://auth.matrix.localhost/bot/moodboard/${roomId}/${eventId}/1">MoodBoard 1 </a>
    
    </li>
	  <li><a target="_blank" href="http://auth.matrix.localhost/bot/moodboard/${roomId}/${eventId}/2">MoodBoard 2 </a></li>
	</ul>
  `;
}

export function renderMoodboard(moodboardId: string) {
  return `Moodboard ${moodboardId}`;
}

import { moodBoards } from "./config.ts";

export function renderMoodboards(
  roomId: string,
  eventId: string,
  projectId: string,
) {
  return `
	Here are the moodboards available. Select one of them
	<ul>
	  <li>
    <a target="_blank" href="http://auth.matrix.localdomain/bot/moodboard/${roomId}/${eventId}/1">MoodBoard 1 </a>
    
    </li>
	  <li><a target="_blank" href="http://auth.matrix.localdomain/bot/moodboard/${roomId}/${eventId}/2">MoodBoard 2 </a></li>
	</ul>
  `;
}

export function renderMoodboard(moodboardId: string) {
  const moodboard = moodBoards[moodboardId];
  if (!moodboard) {
    return ``;
  }
  return `
  <h4><a href="${moodboard.url}">Moodboard ${moodboardId}: ${moodboard.title}</a></h4>
  <img src="${moodboard.thumbnail}" width="400px" />

  `;
}

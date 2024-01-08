// import { editUserMessage } from "../../src/matrix";
// import { renderMoodboard } from "../../src/moodboards";

// export default async function moodboard(
//   _,
//   { roomId, boardId, eventId }: Record<string, string>,
// ) {
//   await editUserMessage("dineshdb", roomId, eventId, renderMoodboard(boardId));
//   return new Response(
//     new TextEncoder().encode(`
//   <html>
// <script>
//   window.close();
// </script>
// `),
//     {
//       status: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Content-Type": "text/html",
//       },
//     },
//   );
// }

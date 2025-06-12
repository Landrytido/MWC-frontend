// import React, { useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useNoteTasks } from "../contexts/AppContext";
// import { useApiService } from "../services/apiService";

// interface PendingTasksWidgetProps {
//   className?: string;
// }

// const PendingTasksWidget: React.FC<PendingTasksWidgetProps> = ({
//   className = "",
// }) => {
//   const navigate = useNavigate();
//   const { getPendingTasks, loading } = useNoteTasks();
//   const api = useApiService();

//   const pendingTasks = getPendingTasks();

//   // Charger les tâches en attente au montage
//   useEffect(() => {
//     api.noteTasks.getMyTasks();
//   }, []);

//   const handleToggleTask = useCallback(
//     async (taskId: number) => {
//       try {
//         await api.noteTasks.toggle(taskId);
//       } catch (error) {
//         console.error("Error toggling task:", error);
//       }
//     },
//     [api.noteTasks]
//   );

//   const handleViewNote = (noteId: number) => {
//     navigate(`/dashboard/notes/${noteId}/view`);
//   };

//   // Limiter à 5 tâches les plus récentes
//   const displayTasks = pendingTasks.slice(0, 5);

//   return (
//     <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold text-gray-800">
//           📋 Tâches en attente
//         </h3>
//         <div className="flex items-center space-x-2">
//           <span className="text-sm text-gray-500">
//             {pendingTasks.length} tâche{pendingTasks.length > 1 ? "s" : ""}
//           </span>
//           {pendingTasks.length > 5 && (
//             <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
//               +{pendingTasks.length - 5} autres
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="space-y-3">
//         {loading.isLoading ? (
//           <div className="text-center py-4">
//             <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
//             <p className="mt-2 text-sm text-gray-500">Chargement...</p>
//           </div>
//         ) : displayTasks.length > 0 ? (
//           displayTasks.map((task) => (
//             <div
//               key={task.id}
//               className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
//             >
//               {/* Checkbox */}
//               <button
//                 onClick={() => handleToggleTask(task.id)}
//                 className="mt-1 w-4 h-4 rounded border-2 border-gray-300 hover:border-green-500 flex items-center justify-center transition-colors"
//                 title="Marquer comme terminée"
//               >
//                 {task.completed && (
//                   <svg
//                     className="w-3 h-3 text-green-500"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 )}
//               </button>

//               {/* Contenu de la tâche */}
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-800 truncate">
//                   {task.title}
//                 </p>
//                 <button
//                   onClick={() => handleViewNote(task.noteId)}
//                   className="text-xs text-teal-600 hover:text-teal-800 hover:underline"
//                 >
//                   Voir la note →
//                 </button>
//               </div>

//               {/* Indicateur de sous-tâches */}
//               {(task.totalSubtasks ?? 0) > 0 && (
//                 <div className="flex items-center text-xs text-gray-500">
//                   <svg
//                     className="w-3 h-3 mr-1"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M4 6h16M4 10h16M4 14h16M4 18h16"
//                     />
//                   </svg>
//                   {task.completedSubtasks ?? 0}/{task.totalSubtasks}
//                 </div>
//               )}
//             </div>
//           ))
//         ) : (
//           <div className="text-center py-6 text-gray-500">
//             <div className="mb-2">🎉</div>
//             <p className="text-sm">Aucune tâche en attente !</p>
//             <p className="text-xs">Toutes vos tâches sont terminées.</p>
//           </div>
//         )}
//       </div>

//       {/* Lien pour voir toutes les tâches */}
//       {pendingTasks.length > 0 && (
//         <div className="mt-4 pt-3 border-t border-gray-200">
//           <button
//             onClick={() => {
//               // TODO: Naviguer vers une page dédiée aux tâches de notes
//               // Pour l'instant, on peut utiliser l'onglet tâches du dashboard
//               navigate("/dashboard");
//             }}
//             className="w-full text-sm text-teal-600 hover:text-teal-800 font-medium"
//           >
//             Voir toutes mes tâches de notes →
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PendingTasksWidget;

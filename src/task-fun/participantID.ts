declare const jatos: any;
export let participantID: number;


export async function initializeAndAssignSubjectID(numberOfParticipants = 56) {
    let subjects: number[] = [];

    if (typeof jatos !== 'undefined') {
        // Check if subjects are already defined in the batch session
        const subjectsDefined = await jatos.batchSession.defined("/subjects"); 
        // Note: If `defined` is synchronous, remove `await`. If it returns a promise, keep `await`.
        
        if (!subjectsDefined) {
            // Initialize the subjects list
            for (let i = 1; i <= numberOfParticipants; ++i) {
                subjects.push(i);
            }
            // Wait until setting the subjects completes
            await jatos.batchSession.set("subjects", subjects);
        } else {
            // Wait until getting the subjects completes
            subjects = await jatos.batchSession.get("subjects");
        }

        // Assign a subject ID if available
        if (subjects.length === 0) {
            alert("Sorry, this experiment is no longer available.");
            throw new Error("No subjects available");
        } else {
            const subjectIndex = Math.floor(Math.random() * subjects.length); // Randomly select a subject
            participantID = subjects[subjectIndex];
            subjects.splice(subjectIndex, 1);
            // Wait until setting the updated subjects completes
            await jatos.batchSession.set("subjects", subjects);
        }
    } else {
        // Fallback for local testing
        participantID = Math.floor(Math.random() * numberOfParticipants) + 1;
    }

    return participantID;
}



export async function markSubjectAsCompleted() {
    if (typeof jatos !== 'undefined' && participantID !== null) {
      // Wait for 'get' in case it's asynchronous (if it's synchronous, this won't hurt)
      let subjectsCompleted = await jatos.batchSession.get("subjects_completed") || [];
  
      if (!Array.isArray(subjectsCompleted)) {
        subjectsCompleted = [];
      }
  
      const newParticipant = `Participant${participantID}Done`;
      subjectsCompleted.push(newParticipant);
      
      // Wait for the 'set' call to complete before proceeding or calling another batch session modification
      await jatos.batchSession.set("subjects_completed", subjectsCompleted);
    }
  }

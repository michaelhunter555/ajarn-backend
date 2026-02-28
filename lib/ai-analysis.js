const OpenAI = require("openai");
//create GPT client
const createGPTClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPENAI_PROJECT_ID,
  });
};

/**
 * @name analyzeScreening
 * @description Analyze screening questions and provide critical feedback to the employer.
 * @param { string[] } questions 
 */
const analyzeScreening = (questions, jobDetails) => [
    {
        role: "system",
        content: `
                You are an English Teaching screening expert 
                providing insight and suggestions based on screening results provided.
                Your aim is to provide general feedback on the screening and then analyze short and long answers and provide critical feedback to the employer.
                Here is the job details: ${JSON.stringify(jobDetails)}.`,
      },
      {
        role: "user",
        content: `
      A user just completed a screening for the job. Here are the questions and answers: ${JSON.stringify(questions)}. Please provide no more than 4 sentences of critical feedback.`,
      },
];

// name location workExperience education skill interests highestCertification nationality
/**
 * @name generateCoverLetter
 * @description Generate a cover letter for a user based on their profile.
 * @param { Object } userData 
 * @returns { Array } context
 */
const generateCoverLetter = (userData) => [
    {
        role: "system",
        content: `
        You are an English Teaching expert in Thailand and a cover letter expert 
        generating a cover letter for a user based on their profile. No more than 200 words.
        `,
    },
    {
        role: "user",
        content: `
        Generate a cover letter for the user based on their profile and job requirements.
        Here is the user's profile: ${JSON.stringify(userData)}.

        Respond with useful headings and subHeadings.
        respond in html format so this can be dangerously set in the frontend.
        You do not need to add html, head, footer, or body tags. Use headings, lists, and paragraphs.
        `,
    },
];

const generateJobDescription = (jobTitle, hours, workPermit, requirements, location, salary) => [
    {
        role: "system",
        content: `
        You are an English Teaching job description expert 
        generating a job description for a user based on their profile and job requirements. No more than 500 words.
        If any of the job details are undefined, do not include them in the job description output.
        `,
    },
    {
        role: "user",
        content: `
        Generate a job description for the user based on their profile and job requirements.
        Here is the job title: ${jobTitle}.
        The hours are: ${hours}.
        Work Permit offered?: ${workPermit}.
        Here is the requirements: ${JSON.stringify(requirements)}.
        Here is the location: ${location}.
        Here is the salary: ${salary}.

        Use the following format as an example and structure your response accordingly:
        <h1>${jobTitle}</h1>
        <p>[Add detail job description based on information provided]</p>
        <h2>Requirements</h2>
        <ul>
            <li>Requirement 1</li>
            <li>Requirement 2</li>
            <li>Requirement 3</li>
        </ul>
        <h2>Location[use location provided in the job details - ${location}]</h2>
        <p>Location</p>
        <h2>Salary[use salary provided in the job details - ${salary}]</h2>
        <p>Salary</p>
        <h2>Work Permit[use work permit provided in the job details - ${workPermit}]</h2>
        <p>Work Permit</p>
        <h2>Contract length</h2>
        <p>(Add contract length here - 6 months, 1 year, 2 years, etc.)</p>
        `,
    },
];


const generateQuestions = (jobDetails) => [
    {
        role: "system",
        content: `
        You are an English Teaching questions expert 
        generating questions for a user based on their profile and job requirements.
        `,
    },
    {
        role: "user",
        content: `
        Generate questions for the user based on their profile and job requirements.
        Here is the job details: ${JSON.stringify(jobDetails)}.
        `,
    },
];

module.exports = {
  createGPTClient,
  analyzeScreening,
  generateCoverLetter,
  generateJobDescription,
  generateQuestions,
};
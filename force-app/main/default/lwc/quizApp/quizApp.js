import { LightningElement,track } from 'lwc';

export default class QuizApp extends LightningElement {

    @track selectedAns = {};//for storing ans
    correctAns;
    quizData = [
        {
            id: 1,
            question: "What is the capital of France?",
            options: {
                a: "Paris",
                b: "London",
                c: "Berlin",
                d: "Madrid"
            },
            correctAnswer: "a"
        },

        {
            id: 2,
            question: "Which planet is known as the Red Planet?",
            options: {
                a: "Earth",
                b: "Mars",
                c: "Jupiter",
                d: "Saturn"
            },
            correctAnswer: "b"
        },
        {
            id: 3,
            question: "Who wrote 'Hamlet'?",
            options: {
                a: "William Wordsworth",
                b: "Leo Tolstoy",
                c: "William Shakespeare",
                d: "Mark Twain"
            },
            correctAnswer: "c"
        },
        {
            id: 4,
            question: "What is the largest ocean on Earth?",
            options: {
                a: "Atlantic Ocean",
                b: "Indian Ocean",
                c: "Arctic Ocean",
                d: "Pacific Ocean"

            },
            correctAnswer: "d"
        },
        {
            id: 5,
            question: "Which language runs in a web browser?",
            options: {
                a: "Java",
                b: "C",
                c: "Python",
                d: "JavaScript"

            },
            correctAnswer: "d"
        }
    ];

    get allNotSelected(){
        console.log()
        return !(Object.keys(this.selectedAns).length === this.quizData.length);
    }
    get correctAnsValue(){
        if(this.correctAns>0){
            return true;
        }
        else{
            return false;
        }
    }

    handleChange(event){
        const {name,value} = event.target;
        this.selectedAns = {...this.selectedAns, [name]:value}
        //thsi.selected={"question1":"b"}
       console.log(JSON.stringify(this.selectedAns));
    }

    handleSubmit(event){
        event.preventDefault();// as form always refresh the page to avoid this use this
        console.log(this.selectedAns);
        let correct = this.quizData.filter(item =>{
            return this.selectedAns[item.id] === item.correctAnswer
        })
        /**
         * or use
         * let correct = this.quizData.filter(item => this.selectedAns[item.id] === item.correctAnswer);
         * if you use =>{ then you have to return the value}
         */
        this.correctAns = correct.length;
    } 
    handleReset(){
        this.selectedAns = {};
        this.correctAns = 0;
    }
}
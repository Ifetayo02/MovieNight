const userGreeting = document.getElementById('userGreeting');
const mainHeading = document .getElementById('mainHeading')

const initializeUser=()=>{
    let userName=localStorage.getItem('movieNightName')
    if(!userName || userName == 'null'){
        userName=prompt('Welcome aboard!. What would you like to be called?')
        localStorage.setItem('movieNightName',userName)
    }
        userGreeting.innerHTML=`Welcome,<span class="text-blue-400 font-bold">${userName}</span>`;
        mainHeading.innerHTML=`${userName},find your next <br> favorite movie`
    
}
initializeUser();
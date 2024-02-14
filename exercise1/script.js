let counter = 0;

function clickMeCounter() {
    counter++;
    document.getElementById('counter').innerText = counter;

    if (counter % 10 === 0) {
        updateCounterColor();
    }
}

function updateCounterColor() {
    const colors = ['Red', 'Green', 'Yellow', 'Blue', 'Purple', 'Orange', 'Brown'];
    const colorIndex = (counter / 10 - 1) % colors.length; 

    document.getElementById('counter').style.color = newColor;
}

function toggleVisibility(sectionId) {
    const contentBlock = document.getElementById(sectionId);
    const paragraphs = contentBlock.querySelectorAll('p');
    const toggleButton = contentBlock.querySelector('.HideBtn');

    paragraphs.forEach(paragraph => {
        if (paragraph.style.display === 'none' || paragraph.style.display === '') {
            paragraph.style.display = 'block';
            toggleButton.innerHTML = 'Hide';
        } else {
            paragraph.style.display = 'none';
            toggleButton.innerHTML = 'Show';
        }
    });
}

let keywordsDisplayed = false;

function displayRandomKeywords() {
    if (!keywordsDisplayed) {
        const keywords = ['Honey', 'Egyptian tombs', '3000 years old', 'Britain and Zanzibar War', '38 minutes', 'Eiffel Tower', '15 cm (summer)'];
        const ulElement = document.createElement('ul');

        keywords.forEach(keyword => {
            const liElement = document.createElement('li');
            liElement.textContent = keyword;
            ulElement.appendChild(liElement);
        });

        document.getElementById('randomKeywords').appendChild(ulElement);

        keywordsDisplayed = true; 
    }
}




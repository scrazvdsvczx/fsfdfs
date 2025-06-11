
document.addEventListener('DOMContentLoaded', () => {
    const pageTitleInput = document.getElementById('pageTitle') as HTMLInputElement;
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const receiveTonInput = document.getElementById('receiveTon') as HTMLInputElement;
    const receiveUsdInput = document.getElementById('receiveUsd') as HTMLInputElement;
    const feeTonInput = document.getElementById('feeTon') as HTMLInputElement;
    const feeUsdInput = document.getElementById('feeUsd') as HTMLInputElement;
    const nanoTonAmountInput = document.getElementById('nanoTonAmount') as HTMLInputElement;
    const outputFilenameInput = document.getElementById('outputFilename') as HTMLInputElement;
    const generateButton = document.getElementById('generateButton');
    const filenameError = document.getElementById('filenameError') as HTMLDivElement;

    if (generateButton) {
        generateButton.addEventListener('click', async () => {
            const newPageTitle = pageTitleInput.value.trim();
            const newUsername = usernameInput.value.trim();
            const newReceiveTon = receiveTonInput.value.trim();
            const newReceiveUsd = receiveUsdInput.value.trim();
            const newFeeTon = feeTonInput.value.trim();
            const newFeeUsd = feeUsdInput.value.trim();
            const newNanoTonAmount = nanoTonAmountInput.value.trim();
            let outputFilename = outputFilenameInput.value.trim();

            if (filenameError) {
                filenameError.textContent = ''; // Clear previous errors
            }

            if (!outputFilename) {
                if (filenameError) {
                    filenameError.textContent = 'Имя файла не может быть пустым.';
                }
                return;
            }
            if (!outputFilename.endsWith('.html')) {
                outputFilename += '.html';
            }

            let pageTemplateContent: string;
            try {
                const response = await fetch('js/css/index.html'); // Fetch the template
                if (!response.ok) {
                    throw new Error(`Не удалось загрузить шаблон: ${response.status} ${response.statusText}`);
                }
                pageTemplateContent = await response.text();
            } catch (error) {
                console.error('Ошибка загрузки шаблона js/css/index.html:', error);
                if (filenameError) {
                    filenameError.textContent = `Ошибка загрузки шаблона: ${error instanceof Error ? error.message : String(error)}`;
                }
                return;
            }

            let modifiedContent = pageTemplateContent;

            // Replace title more robustly
            modifiedContent = modifiedContent.replace(
                /<title>.*?<\/title>/is, // case-insensitive and dotall for multiline titles
                `<title>${newPageTitle.replace(/\{username\}/g, newUsername)}</title>`
            );

            // Replace username (slowswags) globally
            const usernameRegex = new RegExp('slowswags', 'g');
            modifiedContent = modifiedContent.replace(usernameRegex, newUsername);

            // Replace transaction amount (based on the original template structure)
            // <p>You will receive: <span>531 TON</span> ($1717.68)</p>
             modifiedContent = modifiedContent.replace(
                /(<p>You will receive: <span>)[^<]+<\/span> \([^<)]+\)(<\/p>)/g,
                `$1${newReceiveTon}</span> (${newReceiveUsd})$2`
            );
            // More specific if the default values "531 TON" and "$1717.68" are guaranteed in the template
            // modifiedContent = modifiedContent.replace(
            //     /<span>531 TON<\/span> \(\$1717.68\)/g,
            //     `<span>${newReceiveTon}</span> (${newReceiveUsd})`
            // );


            // Replace fee amount (based on the original template structure)
            // <p>Transaction fee: <span>31 TON</span> ($100.28)</p>
             modifiedContent = modifiedContent.replace(
                /(<p>Transaction fee: <span>)[^<]+<\/span> \([^<)]+\)(<\/p>)/g,
                `$1${newFeeTon}</span> (${newFeeUsd})$2`
            );
            // More specific if the default values "31 TON" and "$100.28" are guaranteed
            // modifiedContent = modifiedContent.replace(
            //     /<span>31 TON<\/span> \(\$100.28\)/g,
            //     `<span>${newFeeTon}</span> (${newFeeUsd})`
            // );


            // Replace nanoTON amount in script. Make regex more general for the number.
            // Original: amount: "531000000000"
            modifiedContent = modifiedContent.replace(
                /amount: "\d+"/g, 
                `amount: "${newNanoTonAmount}"`
            );
            
            // Create a blob and trigger download
            try {
                const blob = new Blob([modifiedContent], { type: 'text/html;charset=utf-8' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = outputFilename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } catch (downloadError) {
                console.error('Ошибка при скачивании файла:', downloadError);
                 if (filenameError) {
                    filenameError.textContent = `Ошибка при скачивании файла: ${downloadError instanceof Error ? downloadError.message : String(downloadError)}`;
                }
            }
        });
    } else {
        console.error('Кнопка генерации не найдена');
    }
});

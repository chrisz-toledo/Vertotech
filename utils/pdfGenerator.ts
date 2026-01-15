
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePdfFileFromElement = async (element: HTMLElement, fileName: string): Promise<File | null> => {
    try {
        const canvas = await html2canvas(element, {
            scale: 2, 
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
        });

        // A4 page size in pixels at 96 DPI is roughly 794x1123
        const pageHeight = 1123;
        const pageWidth = 794;
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
        });

        const contentHeight = (canvasHeight * pageWidth) / canvasWidth;
        let heightLeft = contentHeight;
        let position = 0;

        pdf.addImage(canvas, 'PNG', 0, position, pageWidth, contentHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - contentHeight;
            pdf.addPage();
            pdf.addImage(canvas, 'PNG', 0, position, pageWidth, contentHeight);
            heightLeft -= pageHeight;
        }
        
        const pdfBlob = pdf.output('blob');
        
        return new File([pdfBlob], fileName, { type: 'application/pdf' });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return null;
    }
};

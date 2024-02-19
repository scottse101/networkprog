import java.net.*;
import java.util.Scanner;

class UDP_Klient {
    public static void main(String[] args) throws Exception {
        final int PORTNR = 1250;

        Scanner leserFraKommandovindu = new Scanner(System.in);
        boolean fortsett = true;

            System.out.print("Oppgi navnet på maskinen der tjenerprogrammet kjører: ");
            String tjenermaskin = leserFraKommandovindu.nextLine();

            DatagramSocket socket = new DatagramSocket();
            InetAddress tjeneradresse = InetAddress.getByName(tjenermaskin);

            byte[] sendData;
            byte[] receiveData = new byte[1024];

        while (fortsett) {
            System.out.println("Skriv det første tallet: ");
            double tall1 = leserFraKommandovindu.nextDouble();
            System.out.println("Skriv det andre tallet: ");
            double tall2 = leserFraKommandovindu.nextDouble();
            leserFraKommandovindu.nextLine();

            System.out.println("Velg operasjon (+ eller -): ");
            String operasjon = leserFraKommandovindu.nextLine();

            String melding = tall1 + "\n" + tall2 + "\n" + operasjon;
            sendData = melding.getBytes();

            DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, tjeneradresse, PORTNR);
            socket.send(sendPacket);

            DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
            socket.receive(receivePacket);

            String respons = new String(receivePacket.getData(), 0, receivePacket.getLength());
            System.out.println("Resultatet fra tjeneren er: " + respons);

            // Spør brukeren om de vil fortsette
            System.out.print("Vil du gjøre en ny kalkulasjon? (ja/nei): ");
            String svar = leserFraKommandovindu.nextLine();
            fortsett = svar.equalsIgnoreCase("ja");
        }
        socket.close();
    }
}

import java.net.*;

class UDPTjener {
    public static void main(String[] args) throws Exception {
        final int PORTNR = 1250;

        DatagramSocket socket = new DatagramSocket(PORTNR);

        while (true) {
            byte[] receiveData = new byte[1024];

            DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
            socket.receive(receivePacket);

            InetAddress klientadresse = receivePacket.getAddress();
            int klientport = receivePacket.getPort();

            String data = new String(receivePacket.getData(), 0, receivePacket.getLength());
            String[] input = data.split("\n");

            double tall1 = Double.parseDouble(input[0]);
            double tall2 = Double.parseDouble(input[1]);
            String operasjon = input[2];

            double resultat = 0;

            if (operasjon.equals("+")) {
                resultat = tall1 + tall2;
            } else if (operasjon.equals("-")) {
                resultat = tall1 - tall2;
            } else {
                resultat = 0; // Handle invalid operation
            }

            String respons = Double.toString(resultat);
            byte[] sendData = respons.getBytes();

            DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, klientadresse, klientport);
            socket.send(sendPacket);
        }
    }
}

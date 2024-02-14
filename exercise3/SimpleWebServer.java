import java.io.*;
import java.net.*;

public class SimpleWebServer {
    public static void main(String[] args) {
        final int PORT = 80; // Port 80 brukes vanligvis for HTTP

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("Web-tjeneren lytter på port " + PORT + "...");

            while (true) {
                try (Socket clientSocket = serverSocket.accept();
                     PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
                     BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()))) {

                    // Leser header fra klienten
                    StringBuilder clientHeader = new StringBuilder();
                    String line;
                    while ((line = in.readLine()) != null && !line.isEmpty()) {
                        clientHeader.append("<LI>").append(line).append("</LI>");
                    }

                    // Bygger HTTP-respons med velkomstmelding og klientens header
                    String response = "HTTP/1.0 200 OK\r\n"
                            + "Content-Type: text/html; charset=utf-8\r\n"
                            + "\r\n"
                            + "<HTML><BODY>\r\n"
                            + "<H1> Hilsen. Du har koblet deg opp til min enkle web-tjener! </H1>\r\n"
                            + "Header fra klient er:\r\n"
                            + "<UL>\r\n"
                            + clientHeader.toString()
                            + "</UL>\r\n"
                            + "</BODY></HTML>\r\n";

                    // Sender HTTP-respons til klienten
                    out.println(response);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}


import java.io.*;
import java.net.*;

class SocketTjener {
  public static void main(String[] args) throws IOException {
    final int PORTNR = 1250;
    ServerSocket tjener = new ServerSocket(PORTNR);
    System.out.println("Logg for tjenersiden. Nå venter vi...");

    while (true) {
      Socket forbindelse = tjener.accept();  // venter inntil noen tar kontakt
      System.out.println("En klient er koblet til!");

      Thread klientTraad = new Thread(new KlientHaandterer(forbindelse));
      klientTraad.start();
    }
  }

  static class KlientHaandterer implements Runnable {
    private Socket forbindelse;

    public KlientHaandterer(Socket forbindelse) {
      this.forbindelse = forbindelse;
    }

  @Override
  public void run() {

    try {
      /* Åpner strømmer for kommunikasjon med klientprogrammet */
      InputStreamReader leseforbindelse = new InputStreamReader(forbindelse.getInputStream());
      BufferedReader leseren = new BufferedReader(leseforbindelse);
      PrintWriter skriveren = new PrintWriter(forbindelse.getOutputStream(), true);

     /* Sender informasjon til klienten */
      skriveren.println("Velkommen til en enkel web-server!");
      skriveren.println("Vennlist skriv tallene og operasjonen (+ eller -) på separate linjer.");

      while (true) {
     /* Leser input fra klienten */
        double tall1 = Double.parseDouble(leseren.readLine());
        double tall2 = Double.parseDouble(leseren.readLine());
        String operasjon = leseren.readLine();

        double resultat = 0;

        if (operasjon.equals("+")) {
          resultat = tall1 + tall2;
        } else if (operasjon.equals("-")) {
          resultat = tall1 - tall2;
        } else {
          skriveren.println("Operasjonen er ikke gyldig.");
          return;
        }

        skriveren.println(resultat);
      }

    } catch (IOException e) {
      System.err.println(e);
    }
    }
  }
}



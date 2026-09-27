"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FORM_ENDPOINT, contactCopy, site } from "@/data/site";

type Status = "idle" | "sending" | "sent" | "error";

const inputCls =
  "w-full bg-transparent border-b hairline py-3 text-lg outline-none transition-colors duration-300 focus:border-ink placeholder:text-mute/50";

function Label({ children, required, htmlFor }: { children: React.ReactNode; required?: boolean; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="label text-mute block">
      {children}
      {required && <span className="text-ink"> *</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm text-mute">{children}</p>;
}

export default function InquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [country, setCountry] = useState<"India" | "Other">("India");
  const [interestError, setInterestError] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const interests = data.getAll("interests").map(String);

    // Native `required` can't express "at least one checkbox", so check it here.
    if (!interests.length) {
      setInterestError(true);
      form.querySelector<HTMLInputElement>('input[name="interests"]')?.focus();
      return;
    }
    setInterestError(false);

    const phone = `${country === "India" ? "+91 " : ""}${data.get("phone")}`;
    data.set("phone", phone);
    data.set("interests", interests.join(", "));

    if (!FORM_ENDPOINT) {
      const name = `${data.get("firstName")} ${data.get("lastName")}`.trim();
      const lines = [
        `Name (bride or groom): ${name}`,
        `Phone: ${phone} (${country === "India" ? "India" : "Other country"})`,
        `Email: ${data.get("email")}`,
        `Date of the event: ${data.get("date")}`,
        `Venue: ${data.get("venue")}`,
        `Area of interest: ${interests.join(", ")}`,
        `Guest count: ${data.get("guests")}`,
        `How did you find us: ${data.get("referral")}`,
        "",
        `Event details:\n${data.get("details")}`,
        "",
        `Our story:\n${data.get("story") || "—"}`,
      ];
      const subject = `Wedding inquiry — ${name} (${data.get("date")})`;
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-x-8 gap-y-12 md:grid-cols-2">
      {/* Name */}
      <fieldset className="md:col-span-2">
        <legend className="label text-mute">
          Name <span className="text-ink">*</span>
        </legend>
        <p className="mt-1 text-sm text-mute">Bride or Groom’s Name</p>
        <div className="mt-2 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <input name="firstName" required autoComplete="given-name" placeholder="First Name" aria-label="First name" className={inputCls} />
          <input name="lastName" required autoComplete="family-name" placeholder="Last Name" aria-label="Last name" className={inputCls} />
        </div>
      </fieldset>

      {/* Phone */}
      <fieldset className="md:col-span-2">
        <legend className="label text-mute">
          Phone <span className="text-ink">*</span>
        </legend>
        <div className="mt-2 grid gap-x-8 gap-y-6 sm:grid-cols-[minmax(0,14rem)_1fr]">
          <div>
            <select
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value as "India" | "Other")}
              aria-label="Country"
              className={`${inputCls} cursor-pointer`}
            >
              <option value="India">India</option>
              <option value="Other">Other country</option>
            </select>
            <Hint>Country</Hint>
          </div>
          <div>
            <div className="flex items-baseline gap-3 border-b hairline focus-within:border-ink transition-colors duration-300">
              {country === "India" && <span className="text-lg text-mute shrink-0">+91</span>}
              <input
                name="phone"
                type="tel"
                required
                autoComplete={country === "India" ? "tel-national" : "tel"}
                inputMode="tel"
                placeholder={country === "India" ? "98765 43210" : "+44 20 1234 5678"}
                pattern={country === "India" ? "[0-9 ]{10,12}" : "\\+?[0-9 ()-]{7,20}"}
                title={country === "India" ? "10-digit mobile number" : "Phone number with country code"}
                aria-label="Phone number"
                className="w-full bg-transparent py-3 text-lg outline-none placeholder:text-mute/50"
              />
            </div>
            <Hint>{country === "India" ? "Number" : "Number, including country code"}</Hint>
          </div>
        </div>
      </fieldset>

      {/* Email */}
      <div className="md:col-span-2">
        <Label htmlFor="email" required>
          Email Address
        </Label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
      </div>

      {/* Story */}
      <div className="md:col-span-2">
        <Label htmlFor="story">What’s your story?</Label>
        <textarea id="story" name="story" rows={3} className={`${inputCls} resize-none`} data-lenis-prevent />
      </div>

      {/* Date + Venue */}
      <div>
        <Label htmlFor="date" required>
          Date of the event
        </Label>
        <input id="date" name="date" type="date" required className={`${inputCls} [color-scheme:light]`} />
      </div>
      <div>
        <Label htmlFor="venue" required>
          Venue
        </Label>
        <input id="venue" name="venue" required className={inputCls} />
      </div>

      {/* Area of interest */}
      <fieldset className="md:col-span-2" aria-describedby="interest-help">
        <legend className="label text-mute">
          Area of interest <span className="text-ink">*</span>
        </legend>
        <p id="interest-help" className="mt-1 mb-5 text-sm text-mute">
          Select all that apply.
        </p>
        <div className="flex flex-wrap gap-3">
          {contactCopy.interests.map((i) => (
            <label key={i} className="cursor-pointer">
              <input type="checkbox" name="interests" value={i} className="peer sr-only" onChange={() => setInterestError(false)} />
              <span className="inline-block rounded-full border hairline px-5 py-2.5 text-sm transition-colors duration-300 peer-checked:bg-ink peer-checked:text-paper peer-checked:border-ink peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 hover:border-ink">
                {i}
              </span>
            </label>
          ))}
        </div>
        {interestError && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            Please select at least one area of interest.
          </p>
        )}
      </fieldset>

      {/* Event details */}
      <div className="md:col-span-2">
        <Label htmlFor="details" required>
          Event Details
        </Label>
        <Hint>Please mention the functions happening with the timings, culture/rituals/ceremonies, and all the fine details.</Hint>
        <textarea id="details" name="details" required rows={5} className={`${inputCls} resize-none`} data-lenis-prevent />
      </div>

      {/* Guest count */}
      <div className="md:col-span-2">
        <Label htmlFor="guests" required>
          Guest Count
        </Label>
        <Hint>No. of expected Guests at each event</Hint>
        <textarea id="guests" name="guests" required rows={2} className={`${inputCls} resize-none`} data-lenis-prevent />
      </div>

      {/* Referral */}
      <div className="md:col-span-2">
        <Label htmlFor="referral" required>
          How did you find us?
        </Label>
        <select id="referral" name="referral" required defaultValue="" className={`${inputCls} cursor-pointer`}>
          <option value="" disabled>
            —Please choose an option—
          </option>
          {contactCopy.referral.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group relative inline-flex w-fit items-center gap-4 overflow-hidden rounded-full bg-ink px-10 py-5 label text-paper disabled:opacity-60"
        >
          <span className="absolute inset-0 translate-y-full rounded-full bg-frost transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0" />
          <span className="relative transition-colors duration-500 group-hover:text-ink">
            {status === "sending" ? "Sending…" : "Send inquiry"}
          </span>
          <span className="relative transition-colors duration-500 group-hover:text-ink" aria-hidden>
            →
          </span>
        </button>
        <AnimatePresence mode="wait">
          {status === "sent" && (
            <motion.p key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-mute" role="status">
              {FORM_ENDPOINT ? "Thank you — we’ll be in touch within 48 hours." : "Your email app should open with the details filled in."}
            </motion.p>
          )}
          {status === "error" && (
            <motion.p key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-red-700" role="alert">
              Something went wrong. Please email us at {site.email}.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

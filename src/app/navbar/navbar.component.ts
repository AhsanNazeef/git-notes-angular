import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { GistService } from '../gist.service';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [FontAwesomeModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  faSearch = faSearch;
  searchTerm = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private gistService: GistService) {
     this.searchSubject
      .pipe(
        debounceTime(1000), 
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        console.log('Sending debounced search to service:', searchTerm);
        this.gistService.setSearch(searchTerm);
      });
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}